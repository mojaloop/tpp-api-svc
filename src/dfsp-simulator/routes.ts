import * as Consents from './handlers/consents'
import * as Authorizations from './handlers/authorizations'

import * as Accounts from './handlers/accounts'
import {
  tppAccountsRequestPostHeaders,
  tppAccountsRequestPostPayload
} from './schemas/tppAccountsRequest'
import {
  tppConsentRequestsPostHeaders,
  tppConsentRequestsPostPayload
} from './schemas/tppConsentRequests'
import {
  tppConsentRequestsIdPatchHeaders,
  tppConsentRequestsIdPatchPayload
} from './schemas/tppConsentRequestsId'
import {
  tppConsentsIdPutHeaders,
  tppConsentsIdPutPayload
} from './schemas/tppConsentsId'
import {
  tppAuthorizationsIdPutHeaders,
  tppAuthorizationsIdPutPayload
} from './schemas/tppAuthorizationsId'

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
      method: 'POST',
      path: '/tppConsentRequests',
      handler: Consents.postConsentRequest,
      options: {
        validate: {
          headers: tppConsentRequestsPostHeaders,
          payload: tppConsentRequestsPostPayload
        }
      }
    },
    {
      method: 'PATCH',
      path: '/tppConsentRequests/{ID}',
      handler: Consents.patchConsentRequest,
      options: {
        validate: {
          headers: tppConsentRequestsIdPatchHeaders,
          payload: tppConsentRequestsIdPatchPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppConsents/{ID}',
      handler: Consents.putConsent,
      options: {
        validate: {
          headers: tppConsentsIdPutHeaders,
          payload: tppConsentsIdPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppAuthorizations/{ID}',
      handler: Authorizations.putAuthorization,
      options: {
        validate: {
          headers: tppAuthorizationsIdPutHeaders,
          payload: tppAuthorizationsIdPutPayload
        }
      }
    }
  ])
}
