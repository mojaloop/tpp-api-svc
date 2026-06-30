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
 --------------
 ******/

'use strict'

import { OpenApiMockGenerator } from '@mojaloop/ml-testing-toolkit-shared-lib';
import { type ProtocolVersions } from './types';

/**
 * A json-schema-faker reference override. Always carries an `id`; the remaining
 * keys are arbitrary JSON-schema / jsf keywords (type, format, const, ...), so
 * the shape is intentionally open.
 */
interface JsfRef {
  id: string
  [key: string]: unknown
}

/** Per-request overrides accepted by generateRequest. */
interface RequestOverride {
  headers?: JsfRef[] | null
  request?: JsfRef[] | null
}

/**
 * Mock Span
 */
class Span {
  isFinished: boolean;

  constructor () {
    this.isFinished = false;
  }

  audit () {
    return jest.fn();
  }

  error () {
    return jest.fn();
  }

  finish () {
    return jest.fn();
  }

  debug () {
    return jest.fn();
  }

  info () {
    return jest.fn();
  }

  getChild () {
    return new Span();
  }
}

const mockSpan = () => {
  return new Span();
}

let openApiMockGenerator: OpenApiMockGenerator | undefined;

// Factory generator for OpenApiRequestGenerator singleton
const init = async () => {
  if (!openApiMockGenerator) {
    openApiMockGenerator = new OpenApiMockGenerator()
    await openApiMockGenerator.load('./src/interface/openapi.yaml')
  }
  return openApiMockGenerator
}

const generateRequestHeaders = async (
  path: string,
  httpMethod: string,
  resource: string,
  protocolVersions: ProtocolVersions,
  overrideRefs: JsfRef[] | null = null
) => {
  const generator = await init()
  // Default header override refs
  const jsfRefs = [
    {
      id: 'Content-Type',
      type: 'string',
      const: `application/vnd.interoperability.${resource}+json;version=${protocolVersions.CONTENT.DEFAULT}`
    },
    {
      id: 'Accept',
      type: 'string',
      const: `application/vnd.interoperability.${resource}+json;version=${protocolVersions.ACCEPT.DEFAULT}`
    },
    {
      id: 'Date',
      type: 'string',
      const: new Date().toUTCString()
    }
  ]

  const headers = await generator.generateRequestHeaders(path, httpMethod, jsfRefs)
  delete headers['Content-Length']
  return headers
}

const generateRequestBody = async (
  path: string,
  httpMethod: string,
  overrideRefs: JsfRef[] | null = null
) => {
  const generator = await init()

  const localOverrideRefs: JsfRef[] = overrideRefs == null ? [] : [...overrideRefs]
  const body = await generator.generateRequestBody(path, httpMethod, localOverrideRefs)
  return body
}

const generateRequestQueryParams = async (
  path: string,
  httpMethod: string,
  overrideRefs: JsfRef[] | null = null
) => {
  const generator = await init()

  const localOverrideRefs: JsfRef[] = overrideRefs == null ? [] : [...overrideRefs]

  const params = await generator.generateRequestQueryParams(path, httpMethod, localOverrideRefs)

  const result: {
    params: typeof params
    toString: () => string
    toURLEncodedString: () => string
  } = {
    params,
    toString: () => {
      return Object.entries(result.params).reduce((acc, [k, v]) => {
        if (acc === '?') {
          return `${acc}${k}=${v}`
        } else {
          return `${acc}&${k}=${v}`
        }
      }, '?')
    },
    toURLEncodedString: () => {
      return encodeURI(result.toString())
    }
  }
  return result
}

const generateRequestPathParams = async (
  path: string,
  httpMethod: string,
  overrideRefs: JsfRef[] | null = null
) => {
  const generator = await init()

  const localOverrideRefs: JsfRef[] = overrideRefs == null ? [] : [...overrideRefs]

  const params = await generator.generateRequestPathParams(path, httpMethod, localOverrideRefs)

  const result: {
    params: typeof params
    toString: () => string
    toURLEncodedString: () => string
  } = {
    params,
    toString: () => {
      return Object.entries(result.params).reduce((acc, [k, v]) => {
        if (acc === '?') {
          return `${acc}${k}=${v}`
        } else {
          return `${acc}&${k}=${v}`
        }
      }, '?')
    },
    toURLEncodedString: () => {
      return encodeURI(result.toString())
    }
  }
  return result
}

const generateRequest = async (
  path: string,
  httpMethod: string,
  resource: string,
  protocolVersions: ProtocolVersions,
  override: RequestOverride | null = null
) => {
  const localOverride: { headers: JsfRef[] | null; request: JsfRef[] | null } = {
    headers: null,
    request: null
  }
  if (override != null) {
    if (override.headers != null) {
      localOverride.headers = [...override.headers]
    }

    if (override.request != null) {
      localOverride.request = [...override.request]
    }
  }
  const headers = await generateRequestHeaders(path, httpMethod, resource, protocolVersions, localOverride.headers)

  const body = httpMethod.toLowerCase() !== 'get'
    ? await generateRequestBody(path, httpMethod, localOverride.request)
    : undefined

  const query = await generateRequestQueryParams(path, httpMethod, localOverride.request)

  const pathParams = await generateRequestPathParams(path, httpMethod, localOverride.request)

  const request = {
    headers,
    body,
    pathParams,
    query
  }
  return request
}

module.exports = {
  mockSpan,
  generateRequest,
  generateRequestBody,
  generateRequestHeaders,
  generateRequestQueryParams,
  init
}
