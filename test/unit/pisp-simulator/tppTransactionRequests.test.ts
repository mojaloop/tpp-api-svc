import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const id = '4b3e8e8c-1234-4abc-89ab-1234567890ab'

const validPutPayload = {
  transactionRequestId: '4b3e8e8c-1234-4abc-89ab-1234567890ab',
  challenge: 'signthischallenge',
  transactionId: '5c4f9f9d-2345-4bcd-9abc-234567890abc',
  transferAmount: { currency: 'USD', amount: '100' },
  payeeReceiveAmount: { currency: 'USD', amount: '99' },
  fees: { currency: 'USD', amount: '1' },
  payer: {
    partyIdInfo: { partyIdType: 'MSISDN', partyIdentifier: '16135551212' }
  },
  payee: {
    partyIdInfo: { partyIdType: 'MSISDN', partyIdentifier: '16135551213' }
  },
  transactionType: { scenario: 'TRANSFER', initiator: 'PAYER', initiatorType: 'CONSUMER' },
  condition: 'HOr2-uPRgmIzKtgZpRG3wCgzcOLwz__67BNeFCwcxJg',
  expiration: '2026-05-28T00:00:00.000Z'
}

describe('PUT /tppTransactionRequests/{ID}', () => {
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
      url: `/tppTransactionRequests/${id}`,
      headers: validHeaders,
      payload: validPutPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when condition is missing', async () => {
    const { condition, ...rest } = validPutPayload
    const response = await server.inject({
      method: 'PUT',
      url: `/tppTransactionRequests/${id}`,
      headers: validHeaders,
      payload: rest
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /tppTransactionRequests/{ID}/error', () => {
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
      url: `/tppTransactionRequests/${id}/error`,
      headers: validHeaders,
      payload: {
        errorInformation: {
          errorCode: '5100',
          errorDescription: 'Transaction request failed'
        }
      }
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when errorInformation is missing', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/tppTransactionRequests/${id}/error`,
      headers: validHeaders,
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })
})
