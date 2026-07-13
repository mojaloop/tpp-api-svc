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
    info: jest.fn()
  }
})

const Sinon = require('sinon')
const Enum = require('@mojaloop/central-services-shared').Enum
const Endpoint = require('@mojaloop/central-services-shared').Util.Endpoints
const Request = require('@mojaloop/central-services-shared').Util.Request
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const TppAuthorizations = require('../../../src/domain/tppAuthorizations')
const TestHelper = require('../../util/helper')
const MockSpan = require('../../util/mockgen').mockSpan
const Config = require('../../../src/lib/config')

// Sinon sandbox is shared across tests and reset in afterEach to prevent stub leakage between cases
let sandbox
let SpanMock = MockSpan()

describe('tppAuthorizations', () => {
  const resource = 'tppAuthorizations'

  beforeAll(() => {
    sandbox = Sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
    // Recreate the span mock so each test starts with a clean tracing state
    SpanMock = MockSpan()
  })

  describe('forwardTppAuthorizations', () => {
    it('forwards a POST request when the payload is undefined', async () => {
      // Simulates a POST where the caller passes null payload; the domain should still succeed
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_POST,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'post',
        { ID: 'auth-123' },
        null,
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizations(...options)

      expect(result).toBe(true)
    })

    it('forwards a GET request', async () => {
      // GET requests carry no body; the domain should forward correctly with null payload
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'auth-123' },
        null,
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizations(...options)

      expect(result).toBe(true)
    })

    it('handles when the endpoint could not be found', async () => {
      // getEndpoint returns undefined when the destination FSP has no registered callback URL;
      // forwardTppAuthorizationsError is stubbed to prevent a second network call in this test
      sandbox.stub(Endpoint, 'getEndpoint').resolves(undefined)
      sandbox.stub(TppAuthorizations, 'forwardTppAuthorizationsError').resolves({})
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_POST,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'post',
        { ID: 'auth-123' },
        { authorizationId: 'auth-123' },
        SpanMock
      ]

      const action = async () => TppAuthorizations.forwardTppAuthorizations(...options)

      await expect(action()).rejects.toThrow(/No FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE endpoint found for tppAuthorizations/)
    })

    it('handles when the request fails', async () => {
      // sendRequest throws a FSPIOP communication error; the domain should re-throw after
      // calling the error callback (forwardTppAuthorizationsError is NOT stubbed here,
      // so a real error-callback attempt is made — this validates the full error path)
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').throws(ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), '', [{ key: 'cause', value: {} }]))
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_POST,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'post',
        { ID: 'auth-123' },
        { authorizationId: 'auth-123' },
        SpanMock
      ]

      const action = async () => TppAuthorizations.forwardTppAuthorizations(...options)

      await expect(action()).rejects.toThrow(/Failed to send HTTP request to host/)
    })

    it('handles missing payload and params.ID', async () => {
      // Edge case: both payload and params.ID are absent; authorizationId resolves to undefined
      // and the domain should not crash when building the URL
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        {},
        null,
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizations(...options)

      expect(result).toBe(true)
    })

    it('handles when span is undefined', async () => {
      // span is optional; the domain must not crash when no tracing context is provided
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_GET,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'get',
        { ID: 'auth-123' },
        { authorizationId: 'auth-123' }
        // span intentionally omitted
      ]

      const result = await TppAuthorizations.forwardTppAuthorizations(...options)

      expect(result).toBe(true)
    })

    it('handles when the request fails and span is undefined', async () => {
      // Combines a network failure with no span; the finally block must not crash
      // trying to call childSpan.error when childSpan is undefined
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').throws(ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), '', [{ key: 'cause', value: {} }]))
      sandbox.stub(TppAuthorizations, 'forwardTppAuthorizationsError').resolves(true)
      const options = [
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_POST,
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        'post',
        { ID: 'auth-123' },
        { authorizationId: 'auth-123' }
        // span intentionally omitted
      ]

      const action = async () => TppAuthorizations.forwardTppAuthorizations(...options)

      await expect(action()).rejects.toThrow(/Failed to send HTTP request to host/)
    })
  })

  describe('forwardTppAuthorizationsError', () => {
    it('sends the error request', async () => {
      // Happy path: resolves the error callback endpoint and sends the PUT successfully
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        'auth-123',
        ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, 'Could not find endpoint'),
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizationsError(...options)

      expect(result).toBe(true)
    })

    it('handles an undefined payload', async () => {
      // The error payload can be undefined if the original error had no serializable body
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        'auth-123',
        undefined,
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizationsError(...options)

      expect(result).toBe(true)
    })

    it('handles a missing authorizationId', async () => {
      // authorizationId may be undefined when the original request had no ID (e.g. malformed input)
      sandbox.stub(Endpoint, 'getEndpoint').resolves('http://localhost:3000')
      sandbox.stub(Request, 'sendRequest').resolves({
        ok: true,
        status: 202,
        statusText: 'Accepted'
      })
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        undefined,
        undefined,
        SpanMock
      ]

      const result = await TppAuthorizations.forwardTppAuthorizationsError(...options)

      expect(result).toBe(true)
    })

    it('handles when the endpoint could not be found', async () => {
      // If the source FSP's error callback URL is also missing, the function must throw
      // rather than silently swallow the failure
      sandbox.stub(Endpoint, 'getEndpoint').resolves(undefined)
      const options = [
        TestHelper.defaultHeaders(resource, Config.PROTOCOL_VERSIONS),
        Enum.Http.Headers.FSPIOP.SOURCE,
        Enum.EndPoints.FspEndpointTemplates.TPP_AUTHORIZATIONS_PUT_ERROR,
        Enum.Http.RestMethods.PUT,
        'auth-123',
        {},
        SpanMock
      ]

      const action = async () => TppAuthorizations.forwardTppAuthorizationsError(...options)

      await expect(action()).rejects.toThrow(/No FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE endpoint found for tppAuthorizations/)
    })
  })
})
