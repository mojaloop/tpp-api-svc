import * as Consents from './handlers/consents'
import * as Authorizations from './handlers/authorizations'
import * as Verifications from './handlers/verifications'
import * as TransactionRequests from './handlers/transactionRequests'

import * as Accounts from './handlers/accounts'
import {
  tppAccountsRequestPostHeaders,
  tppAccountsRequestPostPayload
} from './schemas/tppAccountsRequest'
import {
  tppAccountsIdSignedChallengeGetHeaders,
  tppAccountsIdSignedChallengeGetParams
} from './schemas/tppAccountsIdSignedChallenge'
import {
  tppConsentRequestsPostHeaders,
  tppConsentRequestsPostPayload
} from './schemas/tppConsentRequests'
import {
  tppConsentRequestsIdPatchHeaders,
  tppConsentRequestsIdPatchPayload,
  tppConsentRequestsIdGetHeaders,
  tppConsentRequestsIdGetParams
} from './schemas/tppConsentRequestsId'
import {
  tppConsentsIdPutHeaders,
  tppConsentsIdPutPayload
} from './schemas/tppConsentsId'
import {
  tppAuthorizationsIdPutHeaders,
  tppAuthorizationsIdPutPayload
} from './schemas/tppAuthorizationsId'
import {
  tppVerificationsIdPutHeaders,
  tppVerificationsIdPutPayload
} from './schemas/tppVerificationsId'
import {
  tppTransactionRequestsPostHeaders,
  tppTransactionRequestsPostPayload
} from './schemas/tppTransactionRequests'

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
      method: 'GET',
      path: '/tppAccounts/{ID}/{SignedChallenge}',
      handler: Accounts.getTppAccountsByIdAndSignedChallenge,
      options: {
        validate: {
          headers: tppAccountsIdSignedChallengeGetHeaders,
          params: tppAccountsIdSignedChallengeGetParams
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
      method: 'GET',
      path: '/tppConsentRequests/{ID}',
      handler: Consents.getConsentRequest,
      options: {
        validate: {
          headers: tppConsentRequestsIdGetHeaders,
          params: tppConsentRequestsIdGetParams
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
      path: '/tppConsents',
      handler: Consents.putConsents,
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
    },
    {
      method: 'PUT',
      path: '/tppVerifications/{ID}',
      handler: Verifications.putVerification,
      options: {
        validate: {
          headers: tppVerificationsIdPutHeaders,
          payload: tppVerificationsIdPutPayload
        }
      }
    },
    {
      method: 'POST',
      path: '/tppTransactionRequests',
      handler: TransactionRequests.postTransactionRequest,
      options: {
        validate: {
          headers: tppTransactionRequestsPostHeaders,
          payload: tppTransactionRequestsPostPayload
        }
      }
    }
  ])
}
