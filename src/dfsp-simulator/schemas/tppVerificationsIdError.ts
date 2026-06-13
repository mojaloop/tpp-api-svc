import Joi from 'joi'

export const tppVerificationsIdErrorPutHeaders = Joi.object({
  'content-type': Joi.string().required(),
  'content-length': Joi.string().required(),
  'date': Joi.string().required(),
  'fspiop-source': Joi.string().required(),
  'fspiop-destination': Joi.string().optional(),
  'fspiop-encryption': Joi.string().optional(),
  'fspiop-signature': Joi.string().optional(),
  'fspiop-uri': Joi.string().optional(),
  'fspiop-http-method': Joi.string().optional(),
  'x-forwarded-for': Joi.string().optional()
}).unknown(true)

export const tppVerificationsIdErrorPutParams = Joi.object({
  ID: Joi.string().min(1).required()
})
