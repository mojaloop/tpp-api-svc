import * as Health from './handlers/health'
import * as Services from './handlers/services'
import {
  servicesServiceTypePutHeaders,
  servicesServiceTypePutParams,
  servicesServiceTypePutPayload
} from './schemas/services'

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
    }
  ])
}
