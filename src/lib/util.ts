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
 - Justin Theodorus <justin.theodorus@gmail.com>

 --------------
 ******/
'use strict'

const util = require('util')
const Enum = require('@mojaloop/central-services-shared').Enum

interface SpanTags {
  operationType: string
  operationAction: string
  accountRequestId?: string | undefined
  source?: string
  destination?: string
}

/**
 * The subset of a request that span tags are derived from. Headers, payload and
 * params are all optional because callers may only have some of them available.
 */
interface SpanTagsSource {
  headers?: Record<string, string | undefined> | null
  payload?: { accountRequestId?: string } | null
  params?: { ID?: string } | null
}

const hasStack = (err: unknown): err is { stack: string } =>
  typeof err === 'object' && err !== null && typeof (err as { stack?: unknown }).stack === 'string'

/**
 * @function getStackOrInspect
 * @description Gets the error stack, or uses util.inspect to inspect the error
 * @param {*} err - An error object
 */
function getStackOrInspect (err: unknown): string {
  return hasStack(err) && err.stack ? err.stack : util.inspect(err)
}

/**
 * @function getSpanTags
 * @description Returns span tags based on headers, operationType and action.
 * @param {Object} param
 * @param {string} operationType
 * @param {string} operationAction
 * @returns {Object}
 */
const getSpanTags = ({ headers, payload, params }: SpanTagsSource, operationType: string, operationAction: string): SpanTags => {
  const tags: SpanTags = {
    operationType,
    operationAction,
    accountRequestId: (payload && payload.accountRequestId) || (params && params.ID) || (headers && headers.ID) || undefined
  }
  const source = headers && headers[Enum.Http.Headers.FSPIOP.SOURCE]
  if (source) {
    tags.source = source
  }
  const destination = headers && headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  if (destination) {
    tags.destination = destination
  }
  return tags
}

module.exports = {
  getStackOrInspect,
  getSpanTags
}
