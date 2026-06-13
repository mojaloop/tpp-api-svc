import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('GET /tppConsentRequests/{ID}', () => {
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
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'pispA',
    'accept': 'application/vnd.interoperability.tpp+json;version=2.0'
  }

  it('returns 202 on a valid request', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/tppConsentRequests/12345678-1234-4abc-9abc-123456789012',
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
    expect(response.payload).toBe('')
  })

  it('returns 400 when the accept header is missing', async () => {
    const { accept: _omit, ...headersWithoutAccept } = validHeaders

    const response = await server.inject({
      method: 'GET',
      url: '/tppConsentRequests/12345678-1234-4abc-9abc-123456789012',
      headers: headersWithoutAccept
    })

    expect(response.statusCode).toBe(400)
  })
})
