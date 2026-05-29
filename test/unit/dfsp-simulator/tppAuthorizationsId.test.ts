import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('PUT /tppAuthorizations/{ID}', () => {
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
    'fspiop-source': 'pispA'
  }

  const validPayload = {
    responseType: 'REJECTED'
  }

  const url = '/tppAuthorizations/12345678-1234-4abc-9abc-123456789012'

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when responseType is not in the allowed enum', async () => {
    const response = await server.inject({
      method: 'PUT',
      url,
      headers: validHeaders,
      payload: { responseType: 'MAYBE' }
    })

    expect(response.statusCode).toBe(400)
  })
})
