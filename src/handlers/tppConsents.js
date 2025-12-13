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
const tppConsent = require('../domain/tppConsent')
const LibUtil = require('../lib/util')

/**
 * Operations on /tppConsents
 */
module.exports = {
  /**
   * summary: PostConsents
   * description: The POST /tppConsents request is used to request the creation of a consent for interactions between a PISP and the DFSP who owns the account which a PISP's customer wants to allow the PISP access to.
   * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source, fspiop-destination, fspiop-encryption, fspiop-signature, fspiop-uri, fspiop-http-method
   * produces: application/json
   * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
   */
  post: async (context, request, h) => {
    const histTimerEnd = Metrics.getHistogram(
      'tppConsents_post',
      'Forward POST tppConsents request',
      ['success']
    ).startTimer()

    const span = EventSdk.Tracer.createSpan('tppConsents_post')
    try {
      await span.audit({
        headers: request.headers,
        payload: request.payload
      }, EventSdk.AuditEventAction.start)

      await tppConsent.forwardTppConsent(
        Enum.EndPoints.FspEndpointTemplates.TPP_CONSENTS_POST,
        Enum.Http.RestMethods.POST,
        request.headers,
        'POST',
        request.payload,
        span
      )

      histTimerEnd({ success: true })

      return h.response().code(202)
    } catch (err) {
      const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(err)
      Logger.error(fspiopError)
      histTimerEnd({ success: false })
      throw fspiopError
    } finally {
      if (!span.isFinished) {
        await span.finish()
      }
    }
  }
}
