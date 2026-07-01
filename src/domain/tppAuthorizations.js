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

const Logger = require('@mojaloop/central-services-logger')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Enum = require('@mojaloop/central-services-shared').Enum
const { Endpoints, Request, HeaderValidation } = require('@mojaloop/central-services-shared').Util
const EventSdk = require('@mojaloop/event-sdk')
const Mustache = require('mustache')
const util = require('util')

const Config = require('../lib/config.js')
const { getStackOrInspect } = require('../lib/util.js')

const hubNameRegex = HeaderValidation.getHubNameRegex(Config.HUB_NAME)
const responseType = Enum.Http.ResponseTypes.JSON

/**
 * Forwards a POST or GET /tppAuthorizations request to the destination FSP via the Mojaloop switch.
 *
 * Mojaloop uses an async pattern: the HTTP handler returns 202 immediately and the real
 * response arrives later via a PUT /tppAuthorizations/{ID} callback from the destination FSP.
 * On any forwarding failure, this function notifies the source FSP using forwardTppAuthorizationsError,
 * then re-throws so the handler can log the incident.
 *
 * @param {string} path - Mustache URL template (e.g. /tppAuthorizations/{{ID}})
 * @param {object} headers - FSPIOP headers from the incoming request
 * @param {string} method - HTTP method: POST or GET
 * @param {object} params - Path parameters (e.g. { ID: 'auth-123' })
 * @param {object|null} payload - Request body (null for GET requests)
 * @param {object|null} span - OpenTelemetry span for distributed tracing
 * @returns {boolean} true on success
 */
const forwardTppAuthorizations = async (path, headers, method, params, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppAuthorizations') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  // Fallback ensures authorizationId is always available even when payload is absent (e.g. GET)
  const payloadLocal = payload || { authorizationId: params.ID }
  const authorizationId = (payload && payload.authorizationId) || params.ID
  let fspiopError

  try {
    // Resolve the destination FSP's callback base URL from the central switch registry
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, destination, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppAuthorizations ${authorizationId || 'error.test.js'} to: ${util.inspect(endpoint)}`)
    if (!endpoint) {
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppAuthorizations ${authorizationId} for ${Enum.Http.Headers.FSPIOP.DESTINATION}`, method.toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined, source)
    }
    // Combine the base endpoint URL with the path template and render the {ID} placeholder
    const url = Mustache.render(endpoint + path, {
      ID: authorizationId
    })

    Logger.info(`Forwarding tpp authorizations to endpoint: ${url}`)

    // GET requests must not carry a body per the FSPIOP specification
    const response = await Request.sendRequest({ url, headers, source, destination, method, payload: method.toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined, responseType, span: childSpan, hubNameRegex })

    Logger.info(`Forwarded tpp authorizations ${authorizationId} from ${source} to ${destination} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp authorizations to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
    fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
    // Notify the source FSP of the failure via PUT /tppAuthorizations/{ID}/error before re-throwing
    await forwardTppAuthorizationsError(headers, source, Enum.EndPoints.FspEndpointTypes.TPP_CB_URL_AUTHORIZATIONS_PUT_ERROR, Enum.Http.RestMethods.PUT, authorizationId, fspiopError.toApiErrorObject(Config.ERROR_HANDLING), childSpan)
    throw fspiopError
  } finally {
    if (childSpan && !childSpan.isFinished && fspiopError) {
      const state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, fspiopError.apiErrorCode.code, fspiopError.apiErrorCode.message)
      await childSpan.error(fspiopError, state)
      await childSpan.finish(fspiopError.message, state)
    }
  }
}

/**
 * Sends a FSPIOP error back to the source FSP via PUT /tppAuthorizations/{ID}/error.
 * Called automatically by forwardTppAuthorizations when the forward fails.
 *
 * @param {object} headers - Original FSPIOP headers
 * @param {string} to - FSP ID of the error recipient (the original source)
 * @param {string} path - Mustache error path template (e.g. /tppAuthorizations/{{ID}}/error)
 * @param {string} method - HTTP method (always PUT for error callbacks)
 * @param {string|undefined} authorizationId - ID of the failed authorization request
 * @param {object|undefined} payload - FSPIOP error object to send
 * @param {object|null} span - OpenTelemetry span for distributed tracing
 * @returns {boolean} true on success
 */
const forwardTppAuthorizationsError = async (headers, to, path, method, authorizationId, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppAuthorizationsError') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    // Use the same switch registry to resolve the error callback URL for the recipient FSP
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, to, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppAuthorizations ${authorizationId || 'error.test.js'} to: ${util.inspect(endpoint)}`)

    if (!endpoint) {
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppAuthorizations ${authorizationId} for ${to}`, payload, source)
    }
    const url = Mustache.render(endpoint + path, {
      ID: authorizationId
    })

    Logger.info(`Forwarding tpp authorizations error to endpoint: ${url}`)

    const response = await Request.sendRequest({ url, headers, source, destination, method, payload, responseType, childSpan, hubNameRegex })

    Logger.info(`Forwarding tpp authorizations error for ${authorizationId} from ${source} to ${to} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp authorizations error to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
    const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      const state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, fspiopError.apiErrorCode.code, fspiopError.apiErrorCode.message)
      await childSpan.error(fspiopError, state)
      await childSpan.finish(fspiopError.message, state)
    }
    throw fspiopError
  }
}

module.exports = {
  forwardTppAuthorizations,
  forwardTppAuthorizationsError
}
