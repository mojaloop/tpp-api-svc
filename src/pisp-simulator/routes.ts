import * as Health from './handlers/health'
import * as Services from './handlers/services'
import * as AccountsRequest from './handlers/accountsRequest'
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
    }
  ])
}
