import * as Health from './handlers/health'
import * as Services from './handlers/services'
import * as AccountsRequest from './handlers/accountsRequest'
import * as Accounts from './handlers/accounts'
import * as ConsentRequests from './handlers/consentRequests'
import * as Consents from './handlers/consents'
import {
  servicesServiceTypePutHeaders,
  servicesServiceTypePutParams,
  servicesServiceTypePutPayload,
  servicesServiceTypeErrorPutPayload
} from './schemas/services'
import {
  tppAccountsRequestIdPutHeaders,
  tppAccountsRequestIdPutParams,
  tppAccountsRequestIdPutPayload,
  tppAccountsRequestIdErrorPutPayload
} from './schemas/tppAccountsRequestId'
import {
  tppAccountsIdPutHeaders,
  tppAccountsIdPutParams,
  tppAccountsIdPutPayload,
  tppAccountsIdErrorPutPayload
} from './schemas/tppAccountsId'
import {
  tppConsentRequestsIdPutHeaders,
  tppConsentRequestsIdPutParams,
  tppConsentRequestsIdPutPayload,
  tppConsentRequestsIdPatchPayload,
  tppConsentRequestsIdErrorPutPayload
} from './schemas/tppConsentRequestsId'
import {
  tppConsentsHeaders,
  tppConsentsPostPayload,
  tppConsentsIdGetParams
} from './schemas/tppConsents'

export default function registerPispSimulatorRoutes(server: any) {
  server.route([
    {
      method: 'GET',
      path: '/health',
      handler: Health.getHealth
    },
    {
      method: 'PUT',
      path: '/services/{ServiceType}',
      handler: Services.putServicesByServiceType,
      options: {
        validate: {
          headers: servicesServiceTypePutHeaders,
          params: servicesServiceTypePutParams,
          payload: servicesServiceTypePutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/services/{ServiceType}/error',
      handler: Services.putServicesByServiceTypeError,
      options: {
        validate: {
          headers: servicesServiceTypePutHeaders,
          params: servicesServiceTypePutParams,
          payload: servicesServiceTypeErrorPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppAccountsRequest/{ID}',
      handler: AccountsRequest.putTppAccountsRequestById,
      options: {
        validate: {
          headers: tppAccountsRequestIdPutHeaders,
          params: tppAccountsRequestIdPutParams,
          payload: tppAccountsRequestIdPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppAccountsRequest/{ID}/error',
      handler: AccountsRequest.putTppAccountsRequestByIdError,
      options: {
        validate: {
          headers: tppAccountsRequestIdPutHeaders,
          params: tppAccountsRequestIdPutParams,
          payload: tppAccountsRequestIdErrorPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppAccounts/{ID}',
      handler: Accounts.putTppAccountsById,
      options: {
        validate: {
          headers: tppAccountsIdPutHeaders,
          params: tppAccountsIdPutParams,
          payload: tppAccountsIdPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppAccounts/{ID}/error',
      handler: Accounts.putTppAccountsByIdError,
      options: {
        validate: {
          headers: tppAccountsIdPutHeaders,
          params: tppAccountsIdPutParams,
          payload: tppAccountsIdErrorPutPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppConsentRequests/{ID}',
      handler: ConsentRequests.putTppConsentRequestsById,
      options: {
        validate: {
          headers: tppConsentRequestsIdPutHeaders,
          params: tppConsentRequestsIdPutParams,
          payload: tppConsentRequestsIdPutPayload
        }
      }
    },
    {
      method: 'PATCH',
      path: '/tppConsentRequests/{ID}',
      handler: ConsentRequests.patchTppConsentRequestsById,
      options: {
        validate: {
          headers: tppConsentRequestsIdPutHeaders,
          params: tppConsentRequestsIdPutParams,
          payload: tppConsentRequestsIdPatchPayload
        }
      }
    },
    {
      method: 'PUT',
      path: '/tppConsentRequests/{ID}/error',
      handler: ConsentRequests.putTppConsentRequestsByIdError,
      options: {
        validate: {
          headers: tppConsentRequestsIdPutHeaders,
          params: tppConsentRequestsIdPutParams,
          payload: tppConsentRequestsIdErrorPutPayload
        }
      }
    },
    {
      method: 'POST',
      path: '/tppConsents',
      handler: Consents.postTppConsents,
      options: {
        validate: {
          headers: tppConsentsHeaders,
          payload: tppConsentsPostPayload
        }
      }
    },
    {
      method: 'GET',
      path: '/tppConsents/{ID}',
      handler: Consents.getTppConsentsById,
      options: {
        validate: {
          headers: tppConsentsHeaders,
          params: tppConsentsIdGetParams
        }
      }
    }
  ])
}
