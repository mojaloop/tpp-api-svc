import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('POST /tppTransactionRequests', () => {
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
    transactionRequestId: '12345678-1234-4abc-9abc-123456789012',
    payee: {
      partyIdInfo: { partyIdType: 'MSISDN', partyIdentifier: '16135551212' }
    },
    payer: { partyIdType: 'MSISDN', partyIdentifier: '16135551299' },
    amount: { currency: 'USD', amount: '100' },
    transactionType: { scenario: 'TRANSFER', initiator: 'PAYER', initiatorType: 'CONSUMER' },
    authenticationType: 'OTP'
  }

  it('returns 202 on a valid request', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppTransactionRequests',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(202)
    expect(response.payload).toBe('')
  })

  it('returns 400 when amount is missing', async () => {
    const { amount: _omit, ...payloadWithoutAmount } = validPayload

    const response = await server.inject({
      method: 'POST',
      url: '/tppTransactionRequests',
      headers: validHeaders,
      payload: payloadWithoutAmount
    })

    expect(response.statusCode).toBe(400)
  })
})
