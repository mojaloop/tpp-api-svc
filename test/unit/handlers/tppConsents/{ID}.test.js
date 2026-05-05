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
const Handler = require('../../../../src/domain/tppConsents')
const Config = require('../../../../src/lib/config.js')

let sandbox
const server = new Hapi.Server()

/**
 * Tests for /tppConsents/{ID}
 */
describe('/tppConsents/{ID}', () => {
  // URI
  const resource = 'tppConsents'
  const path = `/${resource}/{ID}`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  afterAll(() => {
    server.stop()
  })

  beforeEach(() => {
    Handler.forwardTppConsents = jest.fn().mockResolvedValue()
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

    it('handles when error is thrown', async () => {
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, Config.PROTOCOL_VERSIONS)
      // Arrange
      const options = {
        method,
        url: path,
        headers
      }
      const err = new Error('Error occurred')
      Handler.forwardTppConsents.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(Handler.forwardTppConsents).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppConsents.mock.results[0].value).rejects.toThrow(err)
      expect(response.statusCode).toBe(202)
    })
  })

  describe('DELETE', () => {
    // HTTP Method
    const method = 'delete'

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

    it('handles when error is thrown', async () => {
      const headers = await Mockgen.generateRequestHeaders(path, method, resource, Config.PROTOCOL_VERSIONS)

      // Arrange
      const options = {
        method,
        url: path,
        headers
      }

      const err = new Error('Error occurred')
      Handler.forwardTppConsents.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(Handler.forwardTppConsents).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppConsents.mock.results[0].value).rejects.toThrow(err)
    })
    it('returns an error response and logs when getSpanTags throws', async () => {
      const LibUtil = require('../../../../src/lib/util')
      const spy = jest.spyOn(LibUtil, 'getSpanTags').mockImplementation(() => {
        throw new Error('forced getSpanTags error')
      })

      const headers = await Mockgen.generateRequestHeaders(path, method, resource, Config.PROTOCOL_VERSIONS)

      const options = {
        method,
        url: path,
        headers
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
