import * as Consents from './handlers/consents'
import * as Transactions from './handlers/transactions'
import * as Authorizations from './handlers/authorizations'

import * as Accounts from './handlers/accounts'
import {
  tppAccountsRequestPostHeaders,
  tppAccountsRequestPostPayload
} from './schemas/tppAccountsRequest'

export default function registerDfspSimulatorRoutes(server: any) {
  server.route([
    {
      method: 'POST',
      path: '/tppAccountsRequest',
      handler: Accounts.postTppAccountsRequest,
      options: {
        validate: {
          headers: tppAccountsRequestPostHeaders,
          payload: tppAccountsRequestPostPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/consents/{id}',
      handler: Consents.putConsent
    },
    {
      method: 'PUT',
      path: '/thirdpartyRequests/transactions/{id}',
      handler: Transactions.putTransaction
    },
    {
      method: 'PUT',
      path: '/thirdpartyRequests/authorizations/{id}',
      handler: Authorizations.putAuthorization
    }
  ])
}