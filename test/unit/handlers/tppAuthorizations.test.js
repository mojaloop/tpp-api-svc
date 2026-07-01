/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
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

 - Miguel Missetcho DEKAKPOEVOU <miguel.dekakpoevou@bftgroup.co>

 --------------
 ******/

'use strict'

jest.mock('@mojaloop/central-services-logger', () => {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
})

const Sinon = require('sinon')
const Hapi = require('@hapi/hapi')

const Mockgen = require('../../util/mockgen.js')
const Helper = require('../../util/helper.js')
const Handler = require('../../../src/domain/tppAuthorizations')
const Config = require('../../../src/lib/config.js')

let sandbox
// A single Hapi server instance is shared across all handler tests to avoid repeated boot overhead
const server = new Hapi.Server()

describe('/tppAuthorizations', () => {
  const resource = 'tppAuthorizations'

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  beforeEach(() => {
    // Replace the real domain function with a jest mock so handler tests never make real HTTP calls
    Handler.forwardTppAuthorizations = jest.fn().mockResolvedValue()
  })

  afterAll(() => {
    server.stop()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /tppAuthorizations', () => {
    const method = 'post'
    const path = `/${resource}`
    // Mockgen cannot generate a valid body for the complex tppAuthorizationsPostRequest schema
    // (UUIDs, Money, PartyIdInfo, Party, TransactionType all required), so we use a hardcoded payload
    const validPayload = {
      authorizationRequestId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
      transactionRequestId: 'a8323bc6-c228-4df2-ae82-e5a997baf898',
      challenge: 'OTk4MjMxMjM0MjM0MjM0MjM0MjM0MjM0MjM0',
      transferAmount: { amount: '100', currency: 'USD' },
      payeeReceiveAmount: { amount: '99', currency: 'USD' },
      fees: { amount: '1', currency: 'USD' },
      payer: {
        partyIdType: 'MSISDN',
        partyIdentifier: '16135551212',
        fspId: 'dfsp1'
      },
      payee: {
        partyIdInfo: {
          partyIdType: 'MSISDN',
          partyIdentifier: '16135551234',
          fspId: 'dfsp2'
        }
      },
      transactionType: {
        scenario: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER'
      },
      expiration: '2026-12-31T00:00:00.000Z'
    }

    it('returns a 202 response code', async () => {
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: validPayload
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(202)
    })

    it('handles when forwardTppAuthorizations throws error', async () => {
      // Even when the domain throws asynchronously, the handler must still return 202
      // because the forward is fire-and-forget (FSPIOP async pattern)
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: validPayload
      }

      const err = new Error('Error occurred')
      Handler.forwardTppAuthorizations.mockImplementation(async () => { throw err })

      const response = await server.inject(options)

      expect(response.statusCode).toBe(202)
      expect(Handler.forwardTppAuthorizations).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAuthorizations.mock.results[0].value).rejects.toThrow(err)
    })
  })

  describe('GET /tppAuthorizations/{ID}', () => {
    const method = 'get'
    const path = `/${resource}/{ID}`
    const url = `/${resource}/auth-123`

    it('returns a 202 response code', async () => {
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url,
        headers: request.headers
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(202)
    })

    it('handles when forwardTppAuthorizations throws error', async () => {
      // Same as POST: async errors from the domain must not change the 202 response
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url,
        headers: request.headers
      }

      const err = new Error('Error occurred')
      Handler.forwardTppAuthorizations.mockImplementation(async () => { throw err })

      const response = await server.inject(options)

      expect(response.statusCode).toBe(202)
      expect(Handler.forwardTppAuthorizations).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAuthorizations.mock.results[0].value).rejects.toThrow(err)
    })
  })
})
