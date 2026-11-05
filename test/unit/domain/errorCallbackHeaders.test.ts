/*****
 License
 --------------
 Copyright © 2020-2026 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Paul Tsai <paultsai.id@gmail.com>

 --------------
 ******/

import { Util } from '@mojaloop/central-services-shared'

const { Headers } = require('@mojaloop/central-services-shared').Util

jest.mock('@mojaloop/central-services-logger', () => ({ info: jest.fn() }))

const ErrorHandler = require('@mojaloop/central-services-error-handling')
const AccountsRequest = require('../../../src/domain/tppAccountsRequest')
const Accounts = require('../../../src/domain/tppAccounts')
const ConsentRequests = require('../../../src/domain/tppConsentRequests')
const Consents = require('../../../src/domain/tppConsents')
const Config = require('../../../src/lib/config')
const MockSpan = require('../../util/mockgen').mockSpan

const forwarders = [
  ['tppAccountsRequest', AccountsRequest.forwardTppAccountsRequest, AccountsRequest.forwardTppAccountsRequestError],
  ['tppAccounts', Accounts.forwardTppAccounts, Accounts.forwardTppAccountsError],
  ['tppConsentRequests', ConsentRequests.forwardTppConsentRequests, ConsentRequests.forwardTppConsentRequestsError],
  ['tppConsents', Consents.forwardTppConsents, Consents.forwardTppConsentsError]
]

describe('error callback headers', () => {
  afterEach(() => jest.restoreAllMocks())

  it.each(forwarders)('sends a %s forwarding failure from the hub back to the original sender', async (resource, forward) => {
    const failure = ErrorHandler.Factory.createFSPIOPError(
      ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
      'DFSP unavailable'
    )
    jest.spyOn(Util.Endpoints, 'getEndpoint')
      .mockResolvedValueOnce('http://dfsp.test')
      .mockResolvedValueOnce('http://pisp.test')
    const sendRequest = jest.spyOn(Util.Request, 'sendRequest')
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce({ status: 200, statusText: 'OK' })
    const headers = Object.freeze({
      'fspiop-source': 'pispa',
      'fspiop-destination': 'dfspa',
      'fspiop-signature': 'original-pisp-signature',
      'content-type': `application/vnd.interoperability.${resource}+json;version=1.1`,
      accept: `application/vnd.interoperability.${resource}+json;version=1`
    })

    await expect(forward(
      `/${resource}/{{ID}}`,
      headers,
      'GET',
      { ID: 'request-123' },
      undefined,
      MockSpan()
    )).rejects.toThrow('DFSP unavailable')

    expect(sendRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
      method: 'PUT',
      source: Config.HUB_NAME,
      destination: 'pispa',
      span: expect.anything(),
      payload: expect.objectContaining({
        errorInformation: expect.objectContaining({ errorCode: '1001' })
      })
    }))
    const outgoing = sendRequest.mock.calls[1]![0]
    const transformed = Headers.transformHeaders(outgoing.headers, {
      httpMethod: outgoing.method,
      sourceFsp: outgoing.source,
      destinationFsp: outgoing.destination,
      protocolVersions: outgoing.protocolVersions,
      hubNameRegex: outgoing.hubNameRegex
    })
    expect(transformed).toEqual({
      'fspiop-source': Config.HUB_NAME,
      'fspiop-destination': 'pispa',
      'content-type': `application/vnd.interoperability.${resource}+json;version=1.1`
    })
    expect(headers['fspiop-source']).toBe('pispa')
    expect(headers['fspiop-destination']).toBe('dfspa')
    expect(headers['fspiop-signature']).toBe('original-pisp-signature')
  })

  it.each(forwarders)('keeps the sender of an incoming %s error', async (resource, _forward, forwardError) => {
    jest.spyOn(Util.Endpoints, 'getEndpoint').mockResolvedValue('http://pisp.test')
    const sendRequest = jest.spyOn(Util.Request, 'sendRequest').mockResolvedValue({ status: 200, statusText: 'OK' })
    const headers = Object.freeze({
      'fspiop-source': 'dfspa',
      'fspiop-destination': 'pispa',
      'fspiop-signature': 'original-dfsp-signature',
      'content-type': `application/vnd.interoperability.${resource}+json;version=1.1`
    })
    const payload = { errorInformation: { errorCode: '3204', errorDescription: 'Account unavailable' } }

    await forwardError(headers, 'pispa', `/${resource}/{{ID}}/error`, 'PUT', 'request-123', payload)

    expect(sendRequest).toHaveBeenCalledWith(expect.objectContaining({
      source: 'dfspa',
      destination: 'pispa',
      headers,
      payload
    }))
    const outgoing = sendRequest.mock.calls[0]![0]
    expect(Headers.transformHeaders(outgoing.headers, {
      httpMethod: outgoing.method,
      sourceFsp: outgoing.source,
      destinationFsp: outgoing.destination,
      protocolVersions: outgoing.protocolVersions,
      hubNameRegex: outgoing.hubNameRegex
    })).toEqual(headers)
  })
})
