import Joi from 'joi'
import { AuthChannels, CorrelationId, PartyIdentifier, Uri } from './common'

export const tppAccountsRequestPostHeaders = Joi.object({
  'content-type': Joi.string().required(),
  'date': Joi.string().required(),
  'fspiop-source': Joi.string().required(),
  'accept': Joi.string().required(),
  'fspiop-destination': Joi.string().optional(),
  'fspiop-encryption': Joi.string().optional(),
  'fspiop-signature': Joi.string().optional(),
  'fspiop-uri': Joi.string().optional(),
  'fspiop-http-method': Joi.string().optional(),
  'x-forwarded-for': Joi.string().optional()
}).unknown(true)

export const tppAccountsRequestPostPayload = Joi.object({
  accountRequestId: CorrelationId,
  partyIdentifier: PartyIdentifier,
  authChannels: AuthChannels,
  callbackUri: Uri
})
