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

 * ModusBox
 - Shashikant Hirugade <shashi.mojaloop@gmail.com>

 - Ernest Tan <ernesttanjianyu@gmail.com>

 --------------
 ******/
'use strict'

import Path from 'path';
import { type Server, type Request, type ResponseToolkit } from '@hapi/hapi';
import { Util } from '@mojaloop/central-services-shared';
import { type Span } from '@mojaloop/event-sdk';
import Plugins from '../../src/plugins';
import Handlers from '../../src/handlers';
import { type ProtocolVersions } from './types';

// @mojaloop/event-sdk exposes Tracer as a top-level export, which a default
// import resolves to `undefined` under this babel/CJS interop. Require it for
// the runtime value (matches src/handlers/tppAccountsRequest.ts); the Span type
// comes from the type-only import above.
const EventSdk = require('@mojaloop/event-sdk');
const OpenapiBackend = Util.OpenapiBackend;

const destinationFsp = 'dfsp2';
const sourceFsp = 'dfsp1';

/**
 * @function defaultHeaders
 * @description This returns a set of default headers used for requests
 *   see https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_message_headers
 * @param resource - the version for the accept and content-type headers
 * @param protocolVersions - object containing the protocol versions config (see default.json)
 * @returns Returns the default headers
 */

function defaultHeaders (resource: string, protocolVersions: ProtocolVersions) {
  // TODO: See API section 3.2.1; what should we do about X-Forwarded-For? Also, should we
  // add/append to this field in all 'queueResponse' calls?
  return {
    accept: `application/vnd.interoperability.${resource}+json;version=${protocolVersions.ACCEPT.DEFAULT}`,
    'fspiop-destination': destinationFsp,
    'content-type': `application/vnd.interoperability.${resource}+json;version=${protocolVersions.CONTENT.DEFAULT}`,
    date: '2019-05-24 08:52:19',
    'fspiop-source': sourceFsp
  }
}

// matches the TraceableRequest pattern in src/handlers/tppAccountsRequest.ts
type TraceableRequest = Request & { span: Span }

const serverSetup = async (server: Server) => {
  const api = await OpenapiBackend.initialise(Path.resolve(__dirname, '../../src/interface/openapi.yaml'), Handlers)
  await Plugins.registerPlugins(server, api)

  // patch span for unit tests
  server.ext('onRequest', (req: Request, h: ResponseToolkit) => {
    const traceable = req as TraceableRequest
    if (!traceable.span) {
      traceable.span = EventSdk.Tracer.createSpan('test-span')
    }
    return h.continue
  })

  // use as a catch-all handler
  server.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    path: '/{path*}',
    handler: (req: Request, h: ResponseToolkit) => {
      return api.handleRequest(
        {
          method: req.method,
          path: req.path,
          body: req.payload,
          query: req.query,
          headers: req.headers
        },
        req,
        h
      )
      // TODO: follow instructions https://github.com/anttiviljami/openapi-backend/blob/master/DOCS.md#postresponsehandler-handler
    }
  })
}

module.exports = {
  defaultHeaders,
  serverSetup
}
