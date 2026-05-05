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

const OpenapiBackend = require('@mojaloop/central-services-shared').Util.OpenapiBackend
const tppAccountsRequest = require('./tppAccountsRequest')
const tppAccountsRequestId = require('./tppAccountsRequest/{ID}')
const tppAccountsIdGet = require('./tppAccounts/{ID}/{SignedChallenge}')
const tppAccountsId = require('./tppAccounts/{ID}')
const tppAccountsErrorByID = require('./tppAccounts/{ID}/error')
const tppAccountsRequestErrorByID = require('./tppAccountsRequest/{ID}/error')
const tppConsentRequests = require('./tppConsentRequests')
const tppConsentRequestsId = require('./tppConsentRequests/{ID}')
const tppConsentRequestsErrorByID = require('./tppConsentRequests/{ID}/error')
const tppConsents = require('./tppConsents')
const tppConsentsId = require('./tppConsents/{ID}')
const health = require('./health')

module.exports = {
  HealthGet: health.get,
  NotifyErrorAccountRequest: tppAccountsRequestErrorByID.put,
  GetAccountRequest: tppAccountsRequestId.get,
  UpdateAccountRequest: tppAccountsRequestId.put,
  AuthorisingAccountsRequest: tppAccountsRequest.post,
  GetAccountsByUserId: tppAccountsIdGet.get,
  UpdateAccountsByUserId: tppAccountsId.put,
  UpdateAccountsByUserIdError: tppAccountsErrorByID.put,
  PostConsents: tppConsents.post,
  GetConsent: tppConsentsId.get,
  DeleteConsentByID: tppConsentsId.delete,
  CreateConsentRequest: tppConsentRequests.post,
  GetConsentRequestsById: tppConsentRequestsId.get,
  UpdateConsentRequest: tppConsentRequestsId.put,
  PatchConsentRequest: tppConsentRequestsId.patch,
  NotifyErrorConsentRequests: tppConsentRequestsErrorByID.put,
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}
