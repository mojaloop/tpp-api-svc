const path = require('path')
const { randomUUID } = require('crypto')
const { loadFeature, defineFeature } = require('jest-cucumber')
const payload = require('./postTppConsentRequests.payload.json')

const BASE_URL = 'http://localhost:4003'
const CONTENT_TYPE = 'application/vnd.interoperability.tppConsentRequests+json;version=1.1'

const feature = loadFeature(path.join(__dirname, 'postTppConsentRequests.feature'))

defineFeature(feature, (test) => {
  test('PISP sends a consent request to tpp-api-svc', ({ given, when, then }) => {
    let response

    given('tpp-api-svc and the testing toolkit are running and healthy', async () => {
      const health = await fetch(`${BASE_URL}/health`)
      expect(health.status).toBe(200)
    })

    when('the PISP sends POST /tppConsentRequests with the payload', async () => {
      response = await fetch(`${BASE_URL}/tppConsentRequests`, {
        method: 'POST',
        headers: {
          'Content-Type': CONTENT_TYPE,
          Accept: CONTENT_TYPE,
          Date: new Date().toUTCString(),
          'FSPIOP-Source': 'dfspa',
          'FSPIOP-Destination': 'dfspb',
          'FSPIOP-URI': '/tppConsentRequests'
        },
        body: JSON.stringify({ consentRequestId: randomUUID(), ...payload })
      })
    })

    then('tpp-api-svc responds with 202 Accepted', () => {
      expect(response.status).toBe(202)
    })
  })
})
