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

const Mockgen = require('../../../../util/mockgen.js')
const Helper = require('../../../../util/helper')
const Handler = require('../../../../../src/domain/tppConsentRequests')
const Config = require('../../../../../src/lib/config')

let sandbox
const server = new Hapi.Server()

describe('/tppConsentRequests/{ID}/error', () => {
  // URI
  const resource = 'tppConsentRequests'
  const path = `/${resource}/{ID}/error`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    // sandbox.stub(Handler, 'forwardTppConsentRequestsError').returns(Promise.resolve())
    await Helper.serverSetup(server)
  })

  beforeEach(() => {
    Handler.forwardTppConsentRequestsError = jest.fn().mockResolvedValue()
  })

  afterAll(() => {
    server.stop()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('PUT', () => {
    // HTTP Method
    const method = 'put'

    it('handles a PUT', async () => {
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
      Handler.forwardTppConsentRequestsError.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(Handler.forwardTppConsentRequestsError).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppConsentRequestsError.mock.results[0].value).rejects.toThrow(err)
    })

    it('returns an error response and logs when getSpanTags throws', async () => {
      const LibUtil = require('../../../../../src/lib/util')
      const spy = jest.spyOn(LibUtil, 'getSpanTags').mockImplementation(() => {
        throw new Error('forced getSpanTags error')
      })

      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: request.body
      }

      const response = await server.inject(options)

      expect(response.statusCode).not.toBe(200)
      expect(require('@mojaloop/central-services-logger').error).toHaveBeenCalled()

      spy.mockRestore()
    })
  })
})
