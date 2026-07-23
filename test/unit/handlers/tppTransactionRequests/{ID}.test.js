/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the Mojaloop files is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

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

 - Blandine RUFINO <blandine.rufino@bftgroup.co>

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
const Handler = require('../../../../src/domain/tppTransactionRequests')
const Config = require('../../../../src/lib/config.js')

let sandbox
const server = new Hapi.Server()

/**
 * Tests for /tppTransactionRequests/{ID}
 */
describe('/tppTransactionRequests/{ID}', () => {
  // URI
  const resource = 'tppTransactionRequests'
  const path = `/${resource}/{ID}`

  beforeAll(async () => {
    sandbox = Sinon.createSandbox()
    await Helper.serverSetup(server)
  })

  afterAll(() => {
    server.stop()
  })

  beforeEach(() => {
    Handler.forwardTppTransactionRequests = jest.fn().mockResolvedValue()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('PUT', () => {
    // HTTP Method
    const method = 'put'

    it('returns a 200 response code', async () => {
      // Override the condition field to have exactly 43 characters as required by the schema
      const override = {
        request: [
          {
            id: 'condition',
            type: 'string',
            const: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq'
          }
        ]
      }
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS, override)

      // Clean up optional fields from payer and payee that have strict validation patterns
      const cleanedBody = {
        ...request.body,
        payer: {
          partyIdInfo: request.body.payer.partyIdInfo
        },
        payee: {
          partyIdInfo: request.body.payee.partyIdInfo
        }
      }

      // Arrange
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: cleanedBody
      }

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
    })

    it('handles when error is thrown', async () => {
      // Override the condition field to have exactly 43 characters as required by the schema
      const override = {
        request: [
          {
            id: 'condition',
            type: 'string',
            const: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq'
          }
        ]
      }
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS, override)

      // Clean up optional fields from payer and payee that have strict validation patterns
      const cleanedBody = {
        ...request.body,
        payer: {
          partyIdInfo: request.body.payer.partyIdInfo
        },
        payee: {
          partyIdInfo: request.body.payee.partyIdInfo
        }
      }

      // Arrange
      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: cleanedBody
      }

      const err = new Error('Error occurred')
      Handler.forwardTppTransactionRequests.mockImplementation(async () => { throw err })

      // Act
      const response = await server.inject(options)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(Handler.forwardTppTransactionRequests).toHaveBeenCalledTimes(1)
      expect(Handler.forwardTppTransactionRequests.mock.results[0].value).rejects.toThrow(err)
    })

    it('returns an error response and logs when getSpanTags throws', async () => {
      const LibUtil = require('../../../../src/lib/util')
      // Make getSpanTags throw so the handler's try block fails and goes to the catch
      const spy = jest.spyOn(LibUtil, 'getSpanTags').mockImplementation(() => {
        throw new Error('forced getSpanTags error')
      })

      // Override the condition field to have exactly 43 characters as required by the schema
      const override = {
        request: [
          {
            id: 'condition',
            type: 'string',
            const: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq'
          }
        ]
      }
      const request = await Mockgen.generateRequest(path, method, resource, Config.PROTOCOL_VERSIONS, override)

      // Clean up optional fields from payer and payee that have strict validation patterns
      const cleanedBody = {
        ...request.body,
        payer: {
          partyIdInfo: request.body.payer.partyIdInfo
        },
        payee: {
          partyIdInfo: request.body.payee.partyIdInfo
        }
      }

      const options = {
        method,
        url: path,
        headers: request.headers,
        payload: cleanedBody
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
