import { Server } from '@hapi/hapi'
import registerPispSimulator from '../../../src/pisp-simulator'

describe('GET /health', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulator(server)
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
