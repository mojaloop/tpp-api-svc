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
const Handler = require('../../../../src/domain/tppAccountRequest')
const Config = require('../../../../src/lib/config.js')

let sandbox
const server = new Hapi.Server()

/**
 * Tests for /tppAccountRequest/{ID}
 */
describe('/tppAccountRequest/{ID}', () => {
  // URI
  const resource = 'tppAccountRequest'
  const path = `/${resource}/{ID}`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  afterAll(() => {
    server.stop()
  })

  beforeEach(() => {
    Handler.forwardTppAccountRequest = jest.fn().mockResolvedValue()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('GET', () => {
    // HTTP Method
    const method = 'get'

    it('returns a 202 response code', async () => {
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, Config.PROTOCOL_VERSIONS)
      // Arrange
      const options = {
        method,
        url: path,
        headers
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(202)
    })

    it('returns a 406 with invalid protocol version for content-type', async () => {
      const tempProtocolVersion = JSON.parse(JSON.stringify(Config.PROTOCOL_VERSIONS)) // We want to make a deep clone of the config
      tempProtocolVersion.CONTENT.DEFAULT = '0.1' // This is an invalid FSPIOP protocol version
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, tempProtocolVersion)

      // Arrange
      const options = {
        method,
        url: path,
        headers
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(406)
      expect(response.result && response.result.errorInformation && response.result.errorInformation.errorCode).toBe('3001')
      expect(response.result && response.result.errorInformation && response.result.errorInformation.errorDescription).toBe('Unacceptable version requested - Client supplied a protocol version which is not supported by the server')
    })

    it('returns a 406 with invalid protocol version for accept-type', async () => {
      const tempProtocolVersion = JSON.parse(JSON.stringify(Config.PROTOCOL_VERSIONS)) // We want to make a deep clone of the config
      tempProtocolVersion.ACCEPT.DEFAULT = '0.1' // This is an invalid FSPIOP protocol version
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, tempProtocolVersion)

      // Arrange
      const options = {
        method,
        url: path,
        headers
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(406)
      expect(response.result && response.result.errorInformation && response.result.errorInformation.errorCode).toBe('3001')
      expect(response.result && response.result.errorInformation && response.result.errorInformation.errorDescription).toBe('Unacceptable version requested - The Client requested an unsupported version, see extension list for supported version(s).')
    })

    it('handles when error is thrown', async () => {
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, Config.PROTOCOL_VERSIONS)
      // Arrange
      const options = {
        method,
        url: path,
        headers
      }
      const err = new Error('Error occurred')
      Handler.forwardTppAccountRequest.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(Handler.forwardTppAccountRequest).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAccountRequest.mock.results[0].value).rejects.toThrow(err)
      expect(response.statusCode).toBe(202)
    })
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
      Handler.forwardTppAccountRequest.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(Handler.forwardTppAccountRequest).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppAccountRequest.mock.results[0].value).rejects.toThrow(err)
    })
    it('returns an error response and logs when getSpanTags throws', async () => {
      const LibUtil = require('../../../../src/lib/util') // same path your handler uses
      // Make getSpanTags throw so the handler's try block fails and goes to the catch
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

      // The handler re-formats and re-throws as an FSPIOP error; assert non-200 and that we logged the error
      expect(response.statusCode).not.toBe(200)
      expect(require('@mojaloop/central-services-logger').error).toHaveBeenCalled()

      // cleanup
      spy.mockRestore()
    })
  })
})
