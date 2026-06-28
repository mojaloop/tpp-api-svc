import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('PUT /tppConsents', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerDfspSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const validHeaders = {
    'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
    'content-length': '512',
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'pispA'
  }

  const validPayload = {
    scopes: [
      { address: 'acct-001', actions: ['ACCOUNTS_GET_BALANCE'] }
    ],
    credential: {
      credentialType: 'GENERIC',
      status: 'PENDING',
      genericPayload: {
        publicKey: 'cHViLWtleS1ibG9i',
        signature: 'c2lnLWJsb2I'
      }
    }
  }

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/tppConsents',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('')
  })

  it('returns 400 when credentialType is invalid', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/tppConsents',
      headers: validHeaders,
      payload: {
        ...validPayload,
        credential: { ...validPayload.credential, credentialType: 'BOGUS' }
      }
    })

    expect(response.statusCode).toBe(400)
  })
})
