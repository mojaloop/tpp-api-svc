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

 - Shashikant Hirugade <shashi.mojaloop@gmail.com>

 --------------
 ******/

'use strict'

jest.mock('@mojaloop/central-services-logger', () => {
  return {
    info: jest.fn() // suppress info output
  }
})

const Sinon = require('sinon')
const Enum = require('@mojaloop/central-services-shared').Enum
const Endpoint = require('@mojaloop/central-services-shared').Util.Endpoints
const Request = require('@mojaloop/central-services-shared').Util.Request
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const TppAccounts = require('../../../src/domain/tppAccounts')
const TestHelper = require('../../util/helper')
const MockSpan = require('../../util/mockgen').mockSpan
const Config = require('../../../src/lib/config')

let sandbox
let SpanMock = MockSpan()

describe('TppAccounts', () => {
  // URI
  const resource = 'TppAccounts'

  beforeAll(() => {
    sandbox = Sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
    SpanMock = MockSpan()
  })

  describe('forwardTppAccounts', () => {
    it('forwards a GET request when the payload is undefined', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'abcd' },
        { SignedChallenge: '1234' },
        null,
        SpanMock
      ]

      // Act
      const result = await TppAccounts.forwardTppAccounts(...options)

      // Assert
      expect(result).toBe(true)
    })

    it('handles when the endpoint could not be found', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves(undefined)
      sandbox.stub(TppAccounts, 'forwardTppAccountsError').resolves({})
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'abcd' },
        { SignedChallenge: '1234' },
        SpanMock
      ]

      // Act
      const action = async () => TppAccounts.forwardTppAccounts(...options)

      // Assert
      await expect(action()).rejects.toThrow(/No FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE endpoint found for tppAccounts abcd for dfsp1/)
    })

    it('handles when the the request fails', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').throws(ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), '', [{ key: 'cause', value: {} }]))
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'abcd' },
        { SignedChallenge: '1234' },
        SpanMock
      ]

      // Act
      const action = async () => TppAccounts.forwardTppAccounts(...options)

      // Assert
      await expect(action()).rejects.toThrow(/Failed to send HTTP request to host/)
    })

    it('handles missing payload and params.ID', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { },
        null,
        SpanMock
      ]

      // Act
      const result = await TppAccounts.forwardTppAccounts(...options)

      // Assert
      expect(result).toBe(true)
    })

    it('handles when span is undefined', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'abcd' },
        { SignedChallenge: '1234' }
      ]

      // Act
      const result = await TppAccounts.forwardTppAccounts(...options)

      // Assert
      expect(result).toBe(true)
    })

    it('handles when the the request fails and span is undefined', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').throws(ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), '', [{ key: 'cause', value: {} }]))
      sandbox.stub(TppAccounts, 'forwardTppAccountsError').resolves(true)
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'abcd' },
        { SignedChallenge: '1234' }
      ]

      // Act
      const action = async () => TppAccounts.forwardTppAccounts(...options)

      // Assert
      await expect(action()).rejects.toThrow(/Failed to send HTTP request to host/)
    })
  })

  describe('forwardTppAccountsError', () => {
    it('sends the error request ', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        'abcd',
        ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, 'Could not find endpoint'),
        SpanMock
      ]

      // Act
      const result = await TppAccounts.forwardTppAccountsError(...options)

      // Assert
      expect(result).toBe(true)
    })

    it('handles an undefined payload', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        'abcd',
        undefined,
        SpanMock
      ]

      // Act
      const result = await TppAccounts.forwardTppAccountsError(...options)

      // Assert
      expect(result).toBe(true)
    })

    it('handles a missing accountRequestId', async () => {
      // Arrange
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_ACCOUNTS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        undefined,
        undefined,
        SpanMock
      ]

      // Act
      const result = await TppAccounts.forwardTppAccountsError(...options)

      // Assert
      expect(result).toBe(true)
    })
  })
})
