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
    info: jest.fn(), // suppress info output
    debug: jest.fn(),
    error: jest.fn()
  }
})

const Sinon = require('sinon')
const Hapi = require('@hapi/hapi')

const Mockgen = require('../../../util/mockgen.js')
const Helper = require('../../../util/helper.js')
const Handler = require('../../../../src/domain/tppAccounts.js')
const Config = require('../../../../src/lib/config.js')

let sandbox
const server = new Hapi.Server()

/**
 * Tests for /TppAccounts/{ID}
 */
describe('/tppAccounts/{ID}', () => {
  // URI
  const resource = 'tppAccounts'
  const path = `/${resource}/{ID}`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  afterAll(() => {
    server.stop()
  })

  beforeEach(() => {
    Handler.forwardTppAccounts = jest.fn().mockResolvedValue()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('PUT', () => {
    // HTTP Method
    const method = 'put'

    it('returns a 200 response code', async () => {
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      // Arrange
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: request.body
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
    })

    it('handles when error is thrown', async () => {
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      // Arrange
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: request.body
      }

      const err = new Error('Error occurred')
      Handler.forwardTppAccounts.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(Handler.forwardTppAccounts).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAccounts.mock.results[0].value).rejects.toThrow(err)
    })
  })
})
