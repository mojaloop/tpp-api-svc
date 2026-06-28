import Joi from 'joi'

export const tppAccountsIdSignedChallengeGetHeaders = Joi.object({
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

export const tppAccountsIdSignedChallengeGetParams = Joi.object({
  ID: Joi.string().min(1).required(),
  SignedChallenge: Joi.string().min(1).required()
})
