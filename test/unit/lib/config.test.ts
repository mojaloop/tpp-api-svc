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
 - Ernest Tan <ernesttanjianyu@gmail.com>
 - Paul Tsai <paul@socialcashier.com>
 --------------
 ******/
'use strict'

const src = '../../../src/'

const configImport = `${src}/lib/config`

// Derived from the module itself rather than hand-written, so a rename in
// config.js fails here. The property values still resolve to `any` because
// config.js builds its exports through rc and parse-strings-in-object,
// neither of which ships types.
type ConfigModule = typeof import('../../../src/lib/config')
// jest.mock() is hoisted above declarations, so it must take a string literal
// (not the `configImport` const) — otherwise ts-jest's hoisting hits a TDZ
// ReferenceError. requireActual below still uses configImport at runtime.
jest.mock('../../../src/lib/config')

describe('Config tests', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load successfully', async () => {
    // Setup
    let Config: ConfigModule | null = null
    let isSuccess
    // set env var
    process.env.ES_ENDPOINT_SECURITY__JWS__JWS_SIGN = 'false'

    // Act
    try {
      Config = jest.requireActual<ConfigModule>(configImport)
      isSuccess = true
    } catch (e) {
      isSuccess = false
    }

    // Assert
    expect(Config != null).toBe(true)
    expect(isSuccess).toBe(true)
  })

  it('should parse ENV var ALS_PROTOCOL_VERSIONS__ACCEPT__VALIDATELIST as a string', async () => {
    // Setup
    let Config: ConfigModule | null = null
    let isSuccess
    const validateList = ['1']
    // set env var
    process.env.ES_PROTOCOL_VERSIONS__CONTENT__VALIDATELIST = JSON.stringify(validateList)
    process.env.ES_PROTOCOL_VERSIONS__ACCEPT__VALIDATELIST = JSON.stringify(validateList)

    // Act
    try {
      Config = jest.requireActual<ConfigModule>(configImport)
      isSuccess = true
    } catch (e) {
      isSuccess = false
    }

    // Assert
    expect(Config != null).toBe(true)
    expect(isSuccess).toBe(true)
    expect(Config!.PROTOCOL_VERSIONS.CONTENT.VALIDATELIST).toMatchObject(validateList)
    expect(Config!.PROTOCOL_VERSIONS.ACCEPT.VALIDATELIST).toMatchObject(validateList)
  })

  it('should expose ML_TESTING_TOOLKIT_CONFIG when the sandbox block is set', async () => {
    process.env.ES_ML_TESTING_TOOLKIT_CONFIG__TEST_MODE = 'SERVICE'

    try {
      const Config = jest.requireActual<ConfigModule>(configImport)

      expect(Config.ML_TESTING_TOOLKIT_CONFIG).toEqual({ TEST_MODE: 'SERVICE' })
    } finally {
      delete process.env.ES_ML_TESTING_TOOLKIT_CONFIG__TEST_MODE
    }
  })

  it('should leave ML_TESTING_TOOLKIT_CONFIG undefined outside the sandbox', async () => {
    const Config = jest.requireActual<ConfigModule>(configImport)

    expect(Config.ML_TESTING_TOOLKIT_CONFIG).toBeUndefined()
  })

  it('should fail to load when the sandbox block is incomplete', async () => {
    process.env.ES_ML_TESTING_TOOLKIT_CONFIG__TEST_MODE = 'PISP'

    try {
      expect(() => jest.requireActual<ConfigModule>(configImport))
        .toThrow(/PISP_CALLBACK_ENDPOINT is required/)
    } finally {
      delete process.env.ES_ML_TESTING_TOOLKIT_CONFIG__TEST_MODE
    }
  })
})
