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

// Endpoint path templates (until they're added to central-services-shared)
const EndpointPaths = {
  TPP_CONSENT_REQUEST_POST: '/tppConsentRequests',
  TPP_CONSENT_REQUEST_GET: '/tppConsentRequests/{{ID}}',
  TPP_CONSENT_REQUEST_PUT: '/tppConsentRequests/{{ID}}',
  TPP_CONSENT_REQUEST_PATCH: '/tppConsentRequests/{{ID}}',
  TPP_CONSENT_REQUEST_PUT_ERROR: '/tppConsentRequests/{{ID}}/error'
}

/**
 * Forwards tppConsentRequests endpoint requests to destination FSP for processing
 *
 * @returns {boolean}
 */
const forwardTppConsentRequest = async (path, headers, method, params, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppConsentRequest') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const payloadLocal = payload || { consentRequestId: params.ID }
  const consentRequestId = (payload && payload.consentRequestId) || params.ID
  let fspiopError

  try {
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, destination, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppConsentRequest ${consentRequestId || 'error.test.js'} to: ${util.inspect(endpoint)}`)
    if (!endpoint) {
      // we didnt get an endpoint for the payee dfsp!
      // make an error callback to the initiator
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppConsentRequest ${consentRequestId} for ${Enum.Http.Headers.FSPIOP.DESTINATION}`, method.toUpperCase() !== Enum.Http.RestMethods.GET ? payload : undefined, source)
    }
    const url = Mustache.render(endpoint + path, {
      ID: consentRequestId
    })

    Logger.info(`Forwarding tpp consent request to endpoint: ${url}`)

    const response = await Request.sendRequest({ url, headers, source, destination, method, payload: method.toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined, responseType, span: childSpan, hubNameRegex })

    Logger.info(`Forwarded tpp consent request ${consentRequestId} from ${source} to ${destination} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp consent request to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
    fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
    await forwardTppConsentRequestError(headers, source, EndpointPaths.TPP_CONSENT_REQUEST_PUT_ERROR, Enum.Http.RestMethods.PUT, consentRequestId, fspiopError.toApiErrorObject(Config.ERROR_HANDLING), childSpan)
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
 * Forwards tppConsentRequest errors to error endpoint
 *
 * @returns {undefined}
 */
const forwardTppConsentRequestError = async (headers, to, path, method, consentRequestId, payload, span = null) => {
  const childSpan = span ? span.getChild('forwardTppConsentRequestError') : undefined
  let endpoint
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    endpoint = await Endpoints.getEndpoint(Config.SWITCH_ENDPOINT, to, Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE)
    Logger.info(`Resolved party ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint for tppConsentRequest ${consentRequestId || 'error.test.js'} to: ${util.inspect(endpoint)}`)

    if (!endpoint) {
      // we didnt get an endpoint for the payee dfsp!
      // make an error callback to the initiator
      throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_FSP_ERROR, `No ${Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TPP_REQ_SERVICE} endpoint found for tppConsentRequest ${consentRequestId} for ${to}`, payload, source)
    }
    const url = Mustache.render(endpoint + path, {
      ID: consentRequestId
    })

    Logger.info(`Forwarding tpp consent request error to endpoint: ${url}`)

    const response = await Request.sendRequest({ url, headers, source, destination, method, payload, responseType, childSpan, hubNameRegex })

    Logger.info(`Forwarding tpp consent request error for ${consentRequestId} from ${source} to ${to} got response ${response.status} ${response.statusText}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

    return true
  } catch (err) {
    Logger.info(`Error forwarding tpp consent request error to endpoint ${endpoint}: ${getStackOrInspect(err)}`)
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
  forwardTppConsentRequest,
  forwardTppConsentRequestError,
  EndpointPaths // Export for use in handlers
}