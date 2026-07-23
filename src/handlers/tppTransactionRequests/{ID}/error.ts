/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

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

 - Blandine RUFINO <blandine.rufino@bftgroup.co>

 --------------
 ******/
'use strict'
import { Enum } from '@mojaloop/central-services-shared';
import { 
  type Request,
  type ResponseToolkit
} from '@hapi/hapi';
import {
  type Span
} from '@mojaloop/event-sdk';

const EventSdk = require('@mojaloop/event-sdk')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const tppTransactionRequests = require('../../../domain/tppTransactionRequests')
const LibUtil = require('../../../lib/util')

type TraceableRequest = Request & { span: Span }
/**
 * Operations on /tppTransactionRequests/{ID}/error
 */
module.exports = {
  /**
   * summary: NotifyErrorTransactionRequest
   * description: DFSP responds to the PISP if something went wrong with processing a transaction request.
   * parameters: ID, body, content-length, content-type, Date, x-forwarded-for, fspiop-source, fspiop-destination, fspiop-encryption, fspiop-signature, fspiop-uri, fspiop-http-method
   * produces: application/json
   * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
   */
  put: async (_context: any, request: TraceableRequest, h: ResponseToolkit) => {
    const histTimerEnd = Metrics.getHistogram(
      'tpp_transaction_requests_error_put',
      'Put tpp transaction request error by Id',
      ['success']
    ).startTimer()
    const span = request.span;
    try {
      const tags = LibUtil.getSpanTags(request, Enum.Events.Event.Type.THIRDPARTY, Enum.Events.Event.Action.PUT)
      span.setTags(tags)
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)
      tppTransactionRequests.forwardTppTransactionRequestsError(request.headers, request.headers[Enum.Http.Headers.FSPIOP.DESTINATION], (<any> Enum.EndPoints.FspEndpointTemplates).TP_TRANSACTION_REQUEST_PUT_ERROR, Enum.Http.RestMethods.PUT, request.params.ID, request.payload, span).catch((err: Error) => {
        // Do nothing with the error - forwardTppTransactionRequestsError takes care of async errors
        request.server.log(['error'], `ERROR - forwardTppTransactionRequests: ${LibUtil.getStackOrInspect(err)}`)
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
