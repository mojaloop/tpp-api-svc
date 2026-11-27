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

export const TEST_MODES = ['PISP', 'DFSP', 'SERVICE'] as const

export type TestMode = (typeof TEST_MODES)[number]

export const CALLBACK_ENDPOINT_KEYS = ['PISP_CALLBACK_ENDPOINT', 'DFSP_CALLBACK_ENDPOINT'] as const

export type CallbackEndpointKey = (typeof CALLBACK_ENDPOINT_KEYS)[number]

export interface SandboxConfig {
  TEST_MODE: TestMode
  PISP_CALLBACK_ENDPOINT?: string
  DFSP_CALLBACK_ENDPOINT?: string
}

const ROOT = 'ML_TESTING_TOOLKIT_CONFIG'

const REQUIRED_CALLBACK_ENDPOINT: Record<TestMode, CallbackEndpointKey | null> = {
  PISP: 'PISP_CALLBACK_ENDPOINT',
  DFSP: 'DFSP_CALLBACK_ENDPOINT',
  SERVICE: null
}

const format = (value: unknown): string => {
  const rendered = JSON.stringify(value)
  return rendered === undefined ? String(value) : rendered
}

export const messages = {
  notAnObject: (value: unknown): string =>
    `${ROOT} must be an object, got ${format(value)}.`,
  missingTestMode: (): string =>
    `${ROOT}.TEST_MODE is required. Set it to one of ${TEST_MODES.join(', ')}.`,
  invalidTestMode: (value: unknown): string =>
    `${ROOT}.TEST_MODE must be one of ${TEST_MODES.join(', ')}, got ${format(value)}.`,
  missingCallbackEndpoint: (mode: TestMode, key: CallbackEndpointKey): string =>
    `${ROOT}.${key} is required when ${ROOT}.TEST_MODE is ${mode}. Set it to the URL this service should forward PUT callbacks to, for example http://host.docker.internal:3000.`,
  invalidCallbackEndpoint: (key: CallbackEndpointKey, value: unknown): string =>
    `${ROOT}.${key} must be an absolute http or https URL, got ${format(value)}.`
}

const isTestMode = (value: unknown): value is TestMode =>
  typeof value === 'string' && (TEST_MODES as readonly string[]).includes(value)

const isAbsoluteHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false
  }
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return false
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:'
}

const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || value === ''

export const validateSandboxConfig = (raw: unknown): SandboxConfig | undefined => {
  if (isBlank(raw)) {
    return undefined
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(messages.notAnObject(raw))
  }

  const provided = raw as Record<string, unknown>
  const testMode = provided['TEST_MODE']

  if (isBlank(testMode)) {
    throw new Error(messages.missingTestMode())
  }
  if (!isTestMode(testMode)) {
    throw new Error(messages.invalidTestMode(testMode))
  }

  const validated: SandboxConfig = { TEST_MODE: testMode }
  const requiredKey = REQUIRED_CALLBACK_ENDPOINT[testMode]

  if (requiredKey !== null) {
    const endpoint = provided[requiredKey]
    if (isBlank(endpoint)) {
      throw new Error(messages.missingCallbackEndpoint(testMode, requiredKey))
    }
    if (!isAbsoluteHttpUrl(endpoint)) {
      throw new Error(messages.invalidCallbackEndpoint(requiredKey, endpoint))
    }
    validated[requiredKey] = endpoint
  }

  return validated
}
