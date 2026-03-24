'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const Enum = require('@mojaloop/central-services-shared').Enum
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const tppConsentRequests = require('../../../domain/tppConsentRequests')
const LibUtil = require('../../../lib/util')

/**
 * Operations on /tppConsentRequests/{ID}/error
 */
module.exports = {
  /**
   * summary: ConsentRequestError
   * description: If the DFSP is unable to process the consent request, or another processing error occurs, the error callback PUT /tppConsentRequests/{ID}/error is used.
   * parameters: body, content-length
   * produces: application/json
   * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
   */
  put: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_consent_requests_error_put',
      'Put tpp consent request error by Id',
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
      tppConsentRequests.forwardTppConsentRequestsError(tppConsentRequests.EndpointPaths.TPP_CONSENT_REQUEST_PUT_ERROR, request.headers, Enum.Http.RestMethods.PUT, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppConsentRequests takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppConsentRequests: ${LibUtil.getStackOrInspect(err)}`)
      })
      histTimerEnd({ success: true })
      return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
    } catch (err) {
      const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
      Logger.error(fspiopError)
      histTimerEnd({ success: false })
      throw fspiopError
    }
  }
}
