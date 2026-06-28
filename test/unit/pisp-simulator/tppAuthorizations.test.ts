import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const id = '12345678-1234-4abc-9abc-123456789012'

const validPostPayload = {
  authorizationRequestId: id,
  transactionRequestId: '87654321-4321-4dca-8cba-210987654321',
  challenge: 'sign-this-challenge',
  transferAmount: { currency: 'USD', amount: '100' },
  payeeReceiveAmount: { currency: 'USD', amount: '99' },
  fees: { currency: 'USD', amount: '1' },
  payer: { partyIdType: 'MSISDN', partyIdentifier: '16135551212' },
  payee: { partyIdInfo: { partyIdType: 'MSISDN', partyIdentifier: '16135551213' } },
  transactionType: { scenario: 'TRANSFER', initiator: 'PAYER', initiatorType: 'CONSUMER' },
  expiration: '2026-06-16T08:38:08.699-04:00'
}

describe('POST /tppAuthorizations', () => {
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
      method: 'POST',
      url: '/tppAuthorizations',
      headers: validHeaders,
      payload: validPostPayload
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 400 when an amount has a trailing zero', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppAuthorizations',
      headers: validHeaders,
      payload: { ...validPostPayload, transferAmount: { currency: 'USD', amount: '100.00' } }
    })

    expect(response.statusCode).toBe(400)
  })

  it('returns 400 when transactionType is missing', async () => {
    const { transactionType, ...rest } = validPostPayload
    const response = await server.inject({
      method: 'POST',
      url: '/tppAuthorizations',
      headers: validHeaders,
      payload: rest
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('GET /tppAuthorizations/{ID}', () => {
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
      url: `/tppAuthorizations/${id}`,
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
  })
})

describe('PUT /tppAuthorizations/{ID}/error', () => {
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
      url: `/tppAuthorizations/${id}/error`,
      headers: validHeaders,
      payload: {
        errorInformation: {
          errorCode: '3000',
          errorDescription: 'Generic client error'
        }
      }
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when errorCode does not match the pattern', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `${`/tppAuthorizations/${id}`}/error`,
      headers: validHeaders,
      payload: {
        errorInformation: {
          errorCode: 'abcd',
          errorDescription: 'Generic client error'
        }
      }
    })

    expect(response.statusCode).toBe(400)
  })
})
