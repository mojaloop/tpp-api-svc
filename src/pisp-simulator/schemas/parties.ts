import Joi from 'joi'
import { Party, PartyIdType, PartySubIdOrType } from './common'

export const partiesHeaders = Joi.object({
  'content-type': Joi.string().required(),
  'date': Joi.string().required(),
  'fspiop-source': Joi.string().required(),
  'fspiop-destination': Joi.string().optional(),
  'fspiop-encryption': Joi.string().optional(),
  'fspiop-signature': Joi.string().optional(),
  'fspiop-uri': Joi.string().optional(),
  'fspiop-http-method': Joi.string().optional(),
  'x-forwarded-for': Joi.string().optional()
}).unknown(true)

export const partiesTypeIdGetParams = Joi.object({
  Type: PartyIdType.required(),
  ID: Joi.string().min(1).required(),
  SubId: PartySubIdOrType.optional()
})

export const partiesTypeIdPutPayload = Joi.object({
  party: Party.required()
})
