import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('PATCH /tppConsents/{ID}', () => {
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
    'content-length': '256',
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'pispA',
    'accept': 'application/vnd.interoperability.tpp+json;version=2.0'
  }

  it('returns 200 on a valid merge patch', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url: '/tppConsents/12345678-1234-4abc-9abc-123456789012',
      headers: validHeaders,
      payload: { consentState: 'VERIFIED' }
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('')
  })

  it('returns 400 when consentState is not an allowed value', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url: '/tppConsents/12345678-1234-4abc-9abc-123456789012',
      headers: validHeaders,
      payload: { consentState: 'BOGUS' }
    })

    expect(response.statusCode).toBe(400)
  })
})
