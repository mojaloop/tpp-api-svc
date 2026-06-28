import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const url = '/tppConsentRequests/12345678-1234-4abc-9abc-123456789012'

const validScope = {
  address: 'dfspa.username.1234',
  actions: ['ACCOUNTS_GET_BALANCE']
}

describe('PUT /tppConsentRequests/{ID}', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const validPayload = {
    scopes: [validScope],
    authChannels: ['WEB'],
    callbackUri: 'https://pisp.example/cb/12345',
    authUri: 'https://dfsp.example/auth/12345'
  }

  it('returns 200 on a valid WEB request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when authChannels is not in the allowed enum', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: { ...validPayload, authChannels: ['BOGUS'] }
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PATCH /tppConsentRequests/{ID}', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 202 on a valid request', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url,
      headers: validHeaders,
      payload: { authToken: 'abc123' }
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 400 when authToken is missing', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url,
      headers: validHeaders,
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /tppConsentRequests/{ID}/error', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const validPayload = {
    errorInformation: {
      errorCode: '3000',
      errorDescription: 'Generic client error'
    }
  }

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `${url}/error`,
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when errorCode does not match the pattern', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `${url}/error`,
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
