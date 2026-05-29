import { Server } from '@hapi/hapi'
import registerDfspSimulatorRoutes from '../../../src/dfsp-simulator/routes'

describe('POST /tppConsentRequests', () => {
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

  const validPayload = {
    consentRequestId: '12345678-1234-4abc-9abc-123456789012',
    partyIdInfo: {
      partyIdType: 'MSISDN',
      partyIdentifier: '16135551212'
    },
    scopes: [
      {
        address: 'acct-001',
        actions: ['ACCOUNTS_GET_BALANCE']
      }
    ],
    authChannels: ['WEB'],
    callbackUri: 'http://localhost:3000/callback'
  }

  it('returns 202 on a valid request', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppConsentRequests',
      headers: validHeaders,
      payload: validPayload
    })

    expect(response.statusCode).toBe(202)
    expect(response.payload).toBe('')
  })

  it('returns 400 when partyIdType is not in the allowed enum', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tppConsentRequests',
      headers: validHeaders,
      payload: {
        ...validPayload,
        partyIdInfo: { ...validPayload.partyIdInfo, partyIdType: 'NOT_A_REAL_TYPE' }
      }
    })

    expect(response.statusCode).toBe(400)
  })
})
