/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Shashikant Hirugade <shashi.mojaloop@gmail.com>

 --------------
 ******/

'use strict'

jest.mock('@mojaloop/central-services-logger', () => {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
})

const Sinon = require('sinon')
const Hapi = require('@hapi/hapi')

const Mockgen = require('../../util/mockgen.js')
const Helper = require('../../util/helper.js')
const Handler = require('../../../src/domain/tppAccountRequest/tppAccountRequest')
// const OpenApiRequestGenerator = require('../../util/openApiRequestGenerator')
const Config = require('../../../src/lib/config.js')

let sandbox
const server = new Hapi.Server()

/**
 * Tests for /tppAccountRequest
 */
describe('/tppAccountRequest', () => {
  // URI
  const resource = 'tppAccountRequest'
  const path = `/${resource}`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  beforeEach(() => {
    Handler.forwardTppAccountRequest = jest.fn().mockResolvedValue()
  })

  afterAll(() => {
    server.stop()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('POST', () => {
    // HTTP Method
    const method = 'post'
    // Override request refs because OpenApiRequestGenerator is unable to generate unicode test data
    const overrideReq = {
      request: [
        {
          id: 'callbackUri',
          type: 'string',
          format: 'uri',
          const: 'http://localhost:3000/callback'
        },
        {
          id: 'partyItentifier',
          type: 'string',
          const: '16135551212'
        }
      ]
    }

    it('returns a 202 response code', async () => {
      // Generate request
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS, overrideReq)

      // Setup request opts
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: request.body
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(202)
    })

    it('handles when forwardTppAccountRequest throws error', async () => {
      // Generate request
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS, overrideReq)

      // Setup request opts
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: request.body
      }

      const err = new Error('Error occurred')
      Handler.forwardTppAccountRequest.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(Handler.forwardTppAccountRequest).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAccountRequest.mock.results[0].value).rejects.toThrow(err)
    })
  })
})
