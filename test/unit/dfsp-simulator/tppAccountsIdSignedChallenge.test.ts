import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('GET /tppAccounts/{ID}/{SignedChallenge}', () => {
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
    'accept': 'application/vnd.interoperability.tpp+json;version=2'
  }

  const url = '/tppAccounts/12345678-1234-4abc-9abc-123456789012/signed-challenge-blob'

  it('returns 202 on a valid request', async () => {
    const response = await server.inject({
      method: 'GET',
      url,
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
    expect(response.payload).toBe('')
  })

  it('returns 400 when fspiop-source header is missing', async () => {
    const { 'fspiop-source': _omit, ...headersWithoutSource } = validHeaders

    const response = await server.inject({
      method: 'GET',
      url,
      headers: headersWithoutSource
    })

    expect(response.statusCode).toBe(400)
  })
})
