import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

describe('PUT /services/{ServiceType}', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const validHeaders = {
    'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
    'content-length': '256',
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'switch'
  }

  const validPayload = {
    providers: ['dfspa', 'dfspb']
  }

  const url = '/services/THIRD_PARTY_DFSP'

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when ServiceType is not in the allowed enum', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/services/BOGUS',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /services/{ServiceType}/error', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const validHeaders = {
    'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'switch'
  }

  const validPayload = {
    errorInformation: {
      errorCode: '3000',
      errorDescription: 'Generic client error'
    }
  }

  const url = '/services/THIRD_PARTY_DFSP/error'

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when errorCode does not match the pattern', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: {
        errorInformation: {
          errorCode: 'abcd',
          errorDescription: 'Generic client error'
        }
      }
    })

    expect(response.statusCode).toBe(400)
  })
})
