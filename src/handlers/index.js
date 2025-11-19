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
const tppAccountRequest = require('./tppAccountRequest')
const tppAccountRequestId = require('./tppAccountRequest/{ID}')
const tppAccountsIdGet = require('./tppAccounts/{ID}/{SignedChallenge}')
const tppAccountsId = require('./tppAccounts/{ID}')
const tppAccountsErrorByID = require('./tppAccounts/{ID}/error')
const tppAccountRequestErrorByID = require('./tppAccountRequest/{ID}/error')
const health = require('./health')

module.exports = {
  HealthGet: health.get,
  NotifyErrorAccountRequest: tppAccountRequestErrorByID.put,
  GetAccountRequest: tppAccountRequestId.get,
  UpdateAccountRequest: tppAccountRequestId.put,
  AuthorisingAccountRequest: tppAccountRequest.post,
  GetAccountsByUserId: tppAccountsIdGet.get,
  UpdateAccountsByUserId: tppAccountsId.put,
  UpdateAccountsByUserIdError: tppAccountsErrorByID.put,
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}
