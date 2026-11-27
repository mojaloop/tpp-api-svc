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

 - Paul Tsai <paul@socialcashier.com>
 --------------
 ******/
'use strict'

import {
  CALLBACK_ENDPOINT_KEYS,
  TEST_MODES,
  validateSandboxConfig
} from '../../../src/lib/sandboxConfig'

const PLACEHOLDER = 'http://<pisp-specified-callback-endpoint>:<port-number>'

describe('sandboxConfig', () => {
  describe('exported vocabulary', () => {
    it('offers the three test modes from the design', () => {
      expect(TEST_MODES).toEqual(['PISP', 'DFSP', 'SERVICE'])
    })

    it('offers a callback endpoint key per externally driven mode', () => {
      expect(CALLBACK_ENDPOINT_KEYS).toEqual(['PISP_CALLBACK_ENDPOINT', 'DFSP_CALLBACK_ENDPOINT'])
    })
  })

  describe('when the block is absent', () => {
    it.each([undefined, null, ''])('treats %p as not running in the sandbox', (raw) => {
      expect(validateSandboxConfig(raw)).toBeUndefined()
    })
  })

  describe('when the block is not an object', () => {
    it.each([
      ['a string', 'PISP'],
      ['a number', 4003],
      ['an array', ['PISP']],
      ['a function', () => 'PISP']
    ])('rejects %s', (_label, raw) => {
      expect(() => validateSandboxConfig(raw)).toThrow(/ML_TESTING_TOOLKIT_CONFIG must be an object/)
    })
  })

  describe('TEST_MODE', () => {
    it.each([{}, { TEST_MODE: null }, { TEST_MODE: '' }])('requires a value, given %p', (raw) => {
      expect(() => validateSandboxConfig(raw)).toThrow(/TEST_MODE is required/)
    })

    it('names the accepted values when asked for one it does not know', () => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'SWITCH' }))
        .toThrow(/TEST_MODE must be one of PISP, DFSP, SERVICE, got "SWITCH"/)
    })
  })

  describe('PISP mode', () => {
    it('requires a callback endpoint', () => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'PISP' }))
        .toThrow(/PISP_CALLBACK_ENDPOINT is required when ML_TESTING_TOOLKIT_CONFIG.TEST_MODE is PISP/)
    })

    it('rejects the unedited template placeholder', () => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: PLACEHOLDER }))
        .toThrow(/PISP_CALLBACK_ENDPOINT must be an absolute http or https URL/)
    })

    it.each(['localhost:3000', 'ftp://pisp.example', '/callbacks'])('rejects %p', (endpoint) => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: endpoint }))
        .toThrow(/PISP_CALLBACK_ENDPOINT must be an absolute http or https URL/)
    })

    it('rejects an endpoint that is not a string', () => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: 3000 }))
        .toThrow(/PISP_CALLBACK_ENDPOINT must be an absolute http or https URL, got 3000/)
    })

    it.each(['http://host.docker.internal:3000', 'https://pisp.example/callbacks'])('accepts %p', (endpoint) => {
      expect(validateSandboxConfig({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: endpoint }))
        .toEqual({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: endpoint })
    })

    it('ignores the DFSP endpoint the mode does not use', () => {
      const raw = {
        TEST_MODE: 'PISP',
        PISP_CALLBACK_ENDPOINT: 'http://host.docker.internal:3000',
        DFSP_CALLBACK_ENDPOINT: 'http://<dfsp-specified-callback-endpoint>:<port-number>'
      }

      expect(validateSandboxConfig(raw))
        .toEqual({ TEST_MODE: 'PISP', PISP_CALLBACK_ENDPOINT: 'http://host.docker.internal:3000' })
    })
  })

  describe('DFSP mode', () => {
    it('requires a callback endpoint', () => {
      expect(() => validateSandboxConfig({ TEST_MODE: 'DFSP' }))
        .toThrow(/DFSP_CALLBACK_ENDPOINT is required when ML_TESTING_TOOLKIT_CONFIG.TEST_MODE is DFSP/)
    })

    it('accepts a valid endpoint', () => {
      const raw = { TEST_MODE: 'DFSP', DFSP_CALLBACK_ENDPOINT: 'http://host.docker.internal:3001' }

      expect(validateSandboxConfig(raw))
        .toEqual({ TEST_MODE: 'DFSP', DFSP_CALLBACK_ENDPOINT: 'http://host.docker.internal:3001' })
    })
  })

  describe('SERVICE mode', () => {
    it('needs no callback endpoint, since the toolkit emulates every other party', () => {
      expect(validateSandboxConfig({ TEST_MODE: 'SERVICE' })).toEqual({ TEST_MODE: 'SERVICE' })
    })
  })
})
