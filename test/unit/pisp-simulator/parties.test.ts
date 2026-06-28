import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const validPutPayload = {
  party: {
    partyIdInfo: { partyIdType: 'MSISDN', partyIdentifier: '16135551212' },
    name: 'Henrik Karlsson',
    accounts: [{ address: 'moja.blue.1234', currency: 'USD', accountNickname: 'Savings Account' }]
  }
}

describe('GET /parties/{Type}/{ID}', () => {
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
      url: '/parties/MSISDN/16135551212',
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 202 on a valid request with SubId', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/parties/BUSINESS/shoecompany/employee1',
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 400 when the party type is not a valid enum', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/parties/NOTATYPE/16135551212',
      headers: validHeaders
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /parties/{Type}/{ID}', () => {
  let server: Server

  beforeAll(async () => {
    server = new Server()
    registerPispSimulatorRoutes(server)
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 200 on a valid request', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/parties/MSISDN/16135551212',
      headers: validHeaders,
      payload: validPutPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when the party object is missing', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/parties/MSISDN/16135551212',
      headers: validHeaders,
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })
})
