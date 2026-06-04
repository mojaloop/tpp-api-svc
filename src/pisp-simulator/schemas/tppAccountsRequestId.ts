import Joi from 'joi'
import { BinaryString, ConsentRequestChannelType, ErrorInformation, Uri } from './common'

export const tppAccountsRequestIdPutParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppAccountsRequestIdPutHeaders = Joi.object({
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

export const tppAccountsRequestIdPutPayload = Joi.object({
  authChannel: ConsentRequestChannelType.required(),
  callbackUri: Uri.optional(),
  authUri: Uri.optional(),
  authToken: BinaryString.optional()
})

export const tppAccountsRequestIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
