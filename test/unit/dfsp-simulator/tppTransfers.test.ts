import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('POST /tppTransfers', () => {
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
    'fspiop-source': 'pispA'
  }

  const validPayload = {
    executionRequestId: '12345678-1234-4abc-9abc-123456789012',
    transactionRequestId: '87654321-4321-4abc-9abc-210987654321',
    authenticationInfo: {
      authentication: 'OTP',
      authenticationValue: '123456'
    }
  }

  it('returns 202 on a valid transfer execution request', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppTransfers',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(202)
    expect(response.payload).toBe('')
  })

  it('returns 400 when executionRequestId is not a valid CorrelationId', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppTransfers',
      headers: validHeaders,
      payload: { ...validPayload, executionRequestId: 'not-a-uuid' }
    })

    expect(response.statusCode).toBe(400)
  })
})
