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
const Mustache = require('mustache')
const util = require('util')

const Config = require('../lib/config.js')
const { getStackOrInspect } = require('../lib/util.js')

const hubNameRegex = HeaderValidation.getHubNameRegex(Config.HUB_NAME)
const responseType = Enum.Http.ResponseTypes.JSON
const EndpointPaths = {
  TPP_CONSENTS_POST: '/tppConsents',
  TPP_CONSENTS_GET: '/tppConsents/{{ID}}',
  TPP_CONSENTS_DELETE: '/tppConsents/{{ID}}',
  TPP_CONSENTS_PUT_ERROR: '/tppConsents/{{ID}}/error'
}
/**
 * Forwards tppConsents endpoint requests to destination FSP for processing
 *
 * @returns {boolean}
 */
const forwardTppConsents = async (path, headers, method, params, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppConsents') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const payloadLocal = payload || { consentId: params.ID }
  const consentId = (payload && payload.consentId) || params.ID
  let fspiopError

  try {
    // endpoint = 'http://mojaloop-testing-toolkit:4040/tpp' // FOR TESTING PURPOSES WITH TTK
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, destination, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppConsents ${consentId || 'error.test.js'} to: ${util.inspect(endpoint)}`)
    if (!endpoint) {
      // we didnt get an endpoint for the payee dfsp!
      // make an error callback to the initiator
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppConsents ${consentId} for ${Enum.Http.Headers.FSPIOP.DESTINATION}`, method.toUpperCase() !== Enum.Http.RestMethods.GET && method.toUpperCase() !== Enum.Http.RestMethods.DELETE ? payloadLocal : undefined, source)
    }
    const url = Mustache.render(endpoint + path, {
      ID: consentId
    })

    Logger.info(`Forwarding tpp consents to endpoint: ${url}`)

    const response = await Request.sendRequest({ url, headers, source, destination, method, payload: method.toUpperCase() !== Enum.Http.RestMethods.GET && method.toUpperCase() !== Enum.Http.RestMethods.DELETE ? payloadLocal : undefined, responseType, span: childSpan, hubNameRegex })

    Logger.info(`Forwarded tpp consents ${consentId} from ${source} to ${destination} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp consents to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
    fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
    await forwardTppConsentsError(headers, source, EndpointPaths.TPP_CONSENTS_PUT_ERROR, Enum.Http.RestMethods.PUT, consentId, fspiopError.toApiErrorObject(Config.ERROR_HANDLING), childSpan)
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
 * Forwards tppConsents errors to error endpoint
 *
 * @returns {undefined}
 */
const forwardTppConsentsError = async (headers, to, path, method, consentId, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppConsentsError') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    // endpoint = 'http://mojaloop-testing-toolkit:4040/tpp' // FOR TESTING PURPOSES WITH TTK
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, to, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppConsents ${consentId || 'error.test.js'} to: ${util.inspect(endpoint)}`)

    if (!endpoint) {
      // we didnt get an endpoint for the payee dfsp!
      // make an error callback to the initiator
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppConsents ${consentId} for ${to}`, payload, source)
    }
    const url = Mustache.render(endpoint + path, {
      ID: consentId
    })

    Logger.info(`Forwarding tpp consents error to endpoint: ${url}`)

    const response = await Request.sendRequest({ url, headers, source, destination, method, payload, responseType, childSpan, hubNameRegex })

    Logger.info(`Forwarding tpp consents error for ${consentId} from ${source} to ${to} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp consents error to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
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
  EndpointPaths,
  forwardTppConsents,
  forwardTppConsentsError
}
