'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const Enum = require('@mojaloop/central-services-shared').Enum
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const tppConsentRequests = require('../../domain/tppConsentRequests')
const LibUtil = require('../../lib/util')

/**
 * Operations on /tppConsentRequests/{ID}
 */
module.exports = {
  /**
   * summary: GetConsentRequest
   * description: The HTTP request GET /tppConsentRequests/{ID} is used to get information about a previously requested consent.
   * parameters: accept
   * produces: application/json
   * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
   */
  get: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_consent_requests_get',
      'Get tpp consent request by Id',
      ['success']
    ).startTimer()
    const span = request.span
    try {
      const tags = LibUtil.getSpanTags(request, Enum.Events.Event.Type.THIRDPARTY, Enum.Events.Event.Action.LOOKUP)
      span.setTags(tags)
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)
      tppConsentRequests.forwardTppConsentRequest(tppConsentRequests.EndpointPaths.TPP_CONSENT_REQUEST_GET, request.headers, Enum.Http.RestMethods.GET, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppConsentRequest takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppConsentRequest: ${LibUtil.getStackOrInspect(err)}`)
      })
      histTimerEnd({ success: true })
      return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
    } catch (err) {
      const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
      Logger.error(fspiopError)
      histTimerEnd({ success: false })
      throw fspiopError
    }
  },
  /**
   * summary: UpdateConsentRequest
   * description: The callback PUT /tppConsentRequests/{ID} is used by the DFSP to inform the PISP about the result of consent request authorization.
   * parameters: body, content-length
   * produces: application/json
   * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
   */
  put: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_consent_requests_put',
      'Put tpp consent request by Id',
      ['success']
    ).startTimer()
    const span = request.span
    try {
      const tags = LibUtil.getSpanTags(request, Enum.Events.Event.Type.THIRDPARTY, Enum.Events.Event.Action.PUT)
      span.setTags(tags)
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)
      tppConsentRequests.forwardTppConsentRequest(tppConsentRequests.EndpointPaths.TPP_CONSENT_REQUEST_PUT, request.headers, Enum.Http.RestMethods.PUT, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppConsentRequest takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppConsentRequest: ${LibUtil.getStackOrInspect(err)}`)
      })
      histTimerEnd({ success: true })
      return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
    } catch (err) {
      const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
      Logger.error(fspiopError)
      histTimerEnd({ success: false })
      throw fspiopError
    }
  },
  /**
   * summary: PatchConsentRequest
   * description: The PATCH /tppConsentRequests/{ID} is used by the PISP to update the consent request with authentication token.
   * parameters: body, content-length
   * produces: application/json
   * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
   */
  patch: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_consent_requests_patch',
      'Patch tpp consent request by Id',
      ['success']
    ).startTimer()
    const span = request.span
    try {
      const tags = LibUtil.getSpanTags(request, Enum.Events.Event.Type.THIRDPARTY, Enum.Events.Event.Action.PATCH)
      span.setTags(tags)
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)
      tppConsentRequests.forwardTppConsentRequest(tppConsentRequests.EndpointPaths.TPP_CONSENT_REQUEST_PATCH, request.headers, Enum.Http.RestMethods.PATCH, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppConsentRequest takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppConsentRequest: ${LibUtil.getStackOrInspect(err)}`)
      })
      histTimerEnd({ success: true })
      return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
    } catch (err) {
      const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
      Logger.error(fspiopError)
      histTimerEnd({ success: false })
      throw fspiopError
    }
  }
}