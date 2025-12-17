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

const Logger = require('@mojaloop/central-services-logger')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Enum = require('@mojaloop/central-services-shared').Enum
const { Endpoints, Request, HeaderValidation } = require('@mojaloop/central-services-shared').Util
const EventSdk = require('@mojaloop/event-sdk')
const util = require('util')

const Config = require('../lib/config.js')
const { getStackOrInspect } = require('../lib/util.js')

/**
 * @function forwardTppConsent
 *
 * @description This forwards the tppConsent request to the destination FSPIOP-Destination from the headers
 *
 * @param {string} endpoint - The endpoint to forward the request to
 * @param {string} method - The HTTP method to use
 * @param {object} headers - The headers to forward
 * @param {string} dataUri - The data URI
 * @param {object} payload - The payload to forward
 * @param {object} span - The tracing span
 * @throws {Error} - Throws error if forwarding fails
 * @returns {Promise<void>}
 */
async function forwardTppConsent (endpoint, method, headers, dataUri, payload, span) {
  const childSpan = span.getChild('forwardTppConsent')
  const sourceDfspId = headers['fspiop-source']
  const destinationDfspId = headers['fspiop-destination']
  const endpointType = endpoint
  const action = dataUri

  try {
    await childSpan.audit({
      headers,
      dataUri,
      payload
    }, EventSdk.AuditEventAction.start)

    const url = await Endpoints.getEndpoint(Config.HOSTNAME, destinationDfspId, endpointType)
    Logger.info(`forwardTppConsent::url=${url} action=${action} method=${method}`)

    const protectedHeaders = HeaderValidation.getProtectedHeaders(headers)
    Logger.isDebugEnabled && Logger.debug(`forwardTppConsent::protectedHeaders=${JSON.stringify(protectedHeaders)}`)

    const clonedHeaders = { ...headers }
    if (clonedHeaders.accept) {
      delete clonedHeaders.accept
    }

    const updatedHeaders = HeaderValidation.validateConditionalHeaders(clonedHeaders, protectedHeaders)
    if (!updatedHeaders['fspiop-http-method']) {
      updatedHeaders['fspiop-http-method'] = method
    }
    if (!updatedHeaders['fspiop-uri']) {
      updatedHeaders['fspiop-uri'] = action
    }

    Logger.isDebugEnabled && Logger.debug(`forwardTppConsent::url=${url} headers=${JSON.stringify(updatedHeaders)}`)

    const res = await Request.sendRequest(
      url,
      updatedHeaders,
      sourceDfspId,
      destinationDfspId,
      method,
      payload,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`forwardTppConsent::response=${util.inspect(res)}`)

    await childSpan.audit({
      headers,
      dataUri,
      payload
    }, EventSdk.AuditEventAction.finish)

    if (!childSpan.isFinished) {
      await childSpan.finish()
    }
  } catch (err) {
    const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
    const state = {
      status: fspiopError.apiErrorCode.code,
      message: fspiopError.apiErrorCode.message
    }
    await childSpan.error(fspiopError, state)
    await childSpan.finish(fspiopError.message, state)
    Logger.error(`forwardTppConsent::error=${getStackOrInspect(err)}`)
    throw fspiopError
  }
}

module.exports = {
  forwardTppConsent
}
