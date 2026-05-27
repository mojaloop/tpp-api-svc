import Joi from 'joi'

const CorrelationId = Joi.string()
  .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  .required()

const PartyIdentifier = Joi.string().min(1).max(128).required()

const ConsentRequestChannelType = Joi.string().valid('WEB', 'OTP')

const AuthChannels = Joi.array()
  .items(ConsentRequestChannelType)
  .min(1)
  .max(256)
  .required()

const Uri = Joi.string()
  .pattern(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
  .min(1)
  .max(512)
  .required()

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
