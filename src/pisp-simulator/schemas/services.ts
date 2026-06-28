import Joi from 'joi'
import { ExtensionList, ErrorInformation } from './common'

const FspId = Joi.string().min(1).max(32)

const ServiceType = Joi.string().valid('THIRD_PARTY_DFSP', 'PISP', 'AUTH_SERVICE')

export const servicesServiceTypePutParams = Joi.object({
  ServiceType: ServiceType.required()
})

export const servicesServiceTypePutHeaders = Joi.object({
  'content-type': Joi.string().required(),
  'content-length': Joi.string().optional(),
  'date': Joi.string().required(),
  'fspiop-source': Joi.string().required(),
  'fspiop-destination': Joi.string().optional(),
  'fspiop-encryption': Joi.string().optional(),
  'fspiop-signature': Joi.string().optional(),
  'fspiop-uri': Joi.string().optional(),
  'fspiop-http-method': Joi.string().optional(),
  'x-forwarded-for': Joi.string().optional()
}).unknown(true)

export const servicesServiceTypePutPayload = Joi.object({
  providers: Joi.array().items(FspId).min(0).max(256).required(),
  extensionList: ExtensionList.optional()
})

export const servicesServiceTypeErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
