import { Server } from '@hapi/hapi'
import registerDfspSimulator from '../../../src/dfsp-simulator'

describe('GET /health', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerDfspSimulator(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 200 with status OK', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ status: 'OK' })
  })
})
