import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('PUT /tppVerifications/{ID}/error', () => {
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
    'content-length': '128',
    'date': 'Tue, 28 May 2026 00:00:00 GMT',
    'fspiop-source': 'pispA'
  }

  const validPayload = {
    errorInformation: {
      errorCode: '7200',
      errorDescription: 'Generic Thirdparty account linking error'
    }
  }

  it('returns 200 on a valid error callback', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/tppVerifications/12345678-1234-4abc-9abc-123456789012/error',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('')
  })

  it('returns 400 when errorCode has a leading zero', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/tppVerifications/12345678-1234-4abc-9abc-123456789012/error',
      headers: validHeaders,
      payload: {
        errorInformation: { ...validPayload.errorInformation, errorCode: '0200' }
      }
    })

    expect(response.statusCode).toBe(400)
  })
})
