'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const Enum = require('@mojaloop/central-services-shared').Enum
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const tppConsentRequests = require('../domain/tppConsentRequests')
const LibUtil = require('../lib/util')

/**
 * Operations on /tppConsentRequests
 */
module.exports = {
  /**
   * summary: ConsentRequest
   * description: The HTTP request POST /tppConsentRequests is used to request a DFSP to grant access to one or more accounts owned by a customer of the DFSP for the PISP who sends the request.
   * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source, fspiop-destination, fspiop-encryption, fspiop-signature, fspiop-uri, fspiop-http-method
   * produces: application/json
   * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
   */
  post: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_consent_requests_post',
      'Post tpp consent request',
      ['success']
    ).startTimer()
    const span = request.span
    try {
      const tags = LibUtil.getSpanTags(request, Enum.Events.Event.Type.THIRDPARTY, Enum.Events.Event.Action.POST)
      span.setTags(tags)
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)
      tppConsentRequests.forwardTppConsentRequests(tppConsentRequests.EndpointPaths.TPP_CONSENT_REQUEST_POST, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppConsentRequests takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppConsentRequests: ${LibUtil.getStackOrInspect(err)}`)
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
