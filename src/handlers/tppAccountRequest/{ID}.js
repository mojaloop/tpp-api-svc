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

const EventSdk = require('@mojaloop/event-sdk')
const Enum = require('@mojaloop/central-services-shared').Enum
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const tppAccountRequest = require('../../domain/tppAccountRequest/tppAccountRequest')
const LibUtil = require('../../lib/util')

/**
 * Operations on /tppAccountRequest/{ID}
 */
module.exports = {
  /**
   * summary: GetAccountRequest
   * description: The `GET /tppAccountRequest/{ID}` is used to request status of POST /tppAccountRequest/ call. The *{ID}* in the URI should contain the accountRequestId that was assigned to the request by the PISP when the PISP originated the request. The result is return via the PUT callback.
   * parameters: accept
   * produces: application/json
   * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
   */
  get: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_account_requests_get',
      'Get tpp account request by Id',
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
      tppAccountRequest.forwardTppAccountRequest(Enum.EndPoints.FspEndpointTemplates.TP_ACCOUNT_REQUEST_GET, request.headers, Enum.Http.RestMethods.GET, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppAccountRequest takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppAccountRequest: ${LibUtil.getStackOrInspect(err)}`)
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
   * summary: UpdateAccountRequest
   * description: A DFSP uses this callback to (1) inform the PISP that the accountRequest has been accepted, and (2) communicate to the PISP which `authChannel` it should use to authenticate their user with.
   * parameters: body, content-length
   * produces: application/json
   * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
   */
  put: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_account_requests_put',
      'Put tpp account request by Id',
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
      tppAccountRequest.forwardTppAccountRequest(Enum.EndPoints.FspEndpointTemplates.TP_ACCOUNT_REQUEST_PUT, request.headers, Enum.Http.RestMethods.PUT, request.params, request.payload, span).catch(err => {
        // Do nothing with the error - forwardTppAccountRequest takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppAccountRequest: ${LibUtil.getStackOrInspect(err)}`)
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
