import { Server } from '@hapi/hapi'
import registerPispSimulatorRoutes from '../../../src/pisp-simulator/routes'

const validHeaders = {
  'content-type': 'application/vnd.interoperability.tpp+json;version=2.0',
  'date': 'Tue, 28 May 2026 00:00:00 GMT',
  'fspiop-source': 'dfspA'
}

const id = '4b3e8e8c-1234-4abc-89ab-1234567890ab'

const validPostPayload = {
  executionRequestId: '4b3e8e8c-1234-4abc-89ab-1234567890ab',
  transactionRequestId: '5c4f9f9d-2345-4bcd-9abc-234567890abc',
  authenticationInfo: {
    authentication: 'OTP',
    authenticationValue: '123456'
  }
}

const validPutPayload = {
  fulfilment: 'WLctttbu2HvTsa1XWvUoGRcQozHsqeu',
  completedTimestamp: '2026-05-28T00:00:00.000Z',
  transferState: 'COMMITTED'
}

describe('GET /tppTransfers/{ID}', () => {
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
      url: `/tppTransfers/${id}`,
      headers: validHeaders
    })

    expect(response.statusCode).toBe(202)
  })
})

describe('POST /tppTransfers', () => {
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
      url: '/tppTransfers',
      headers: validHeaders,
      payload: validPostPayload
    })

    expect(response.statusCode).toBe(202)
  })

  it('returns 400 when executionRequestId is missing', async () => {
    const { executionRequestId, ...rest } = validPostPayload
    const response = await server.inject({
      method: 'POST',
      url: '/tppTransfers',
      headers: validHeaders,
      payload: rest
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /tppTransfers/{ID}', () => {
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
      url: `/tppTransfers/${id}`,
      headers: validHeaders,
      payload: validPutPayload
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when transferState is missing', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/tppTransfers/${id}`,
      headers: validHeaders,
      payload: { completedTimestamp: '2026-05-28T00:00:00.000Z' }
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PUT /tppTransfers/{ID}/error', () => {
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
      url: `/tppTransfers/${id}/error`,
      headers: validHeaders,
      payload: {
        errorInformation: {
          errorCode: '5100',
          errorDescription: 'Transfer execution failed'
        }
      }
    })

    expect(response.statusCode).toBe(200)
  })

  it('returns 400 when errorInformation is missing', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/tppTransfers/${id}/error`,
      headers: validHeaders,
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })
})
