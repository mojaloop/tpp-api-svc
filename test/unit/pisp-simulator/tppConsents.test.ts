import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const consentId = '12345678-1234-4abc-9abc-123456789012'
const consentRequestId = '87654321-4321-4dca-8cba-210987654321'

const validScope = {
  address: 'dfspa.username.1234',
  actions: ['ACCOUNTS_GET_BALANCE']
}

describe('POST /tppConsents', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const authPayload = {
    consentId,
    scopes: [validScope],
    credential: {
      credentialType: 'GENERIC',
      status: 'PENDING',
      genericPayload: {
        publicKey: 'cHVibGljLWtleQ',
        signature: 'c2lnbmF0dXJl'
      }
    },
    status: 'ISSUED'
  }

  const pispPayload = {
    consentId,
    consentRequestId,
    scopes: [validScope],
    status: 'ISSUED'
  }

  it('returns 202 on a valid AUTH credential request', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppConsents',
      headers: validHeaders,
      payload: authPayload
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 202 on a valid PISP provisional request', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppConsents',
      headers: validHeaders,
      payload: pispPayload
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 400 when status is not in the allowed enum', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppConsents',
      headers: validHeaders,
      payload: { ...pispPayload, status: 'BOGUS' }
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('GET /tppConsents/{ID}', () => {
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
      method: 'GET',
      url: `/tppConsents/${consentId}`,
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
  })
})
