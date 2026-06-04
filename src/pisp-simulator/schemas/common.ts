import Joi from 'joi'

export const BinaryString = Joi.string()
  .pattern(/^[A-Za-z0-9-_]+[=]{0,2}$/)
  .required()

const ExtensionKey = Joi.string().min(1).max(32).required()
const ExtensionValue = Joi.string().min(1).max(128).required()

const Extension = Joi.object({
  key: ExtensionKey,
  value: ExtensionValue
})

export const ExtensionList = Joi.object({
  extension: Joi.array().items(Extension).min(1).max(16).required()
})

export const CorrelationId = Joi.string()
  .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  .required()

export const Uri = Joi.string()
  .pattern(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
  .min(1)
  .max(512)
  .required()

export const PartyIdentifier = Joi.string().min(1).max(128).required()

export const ConsentRequestChannelType = Joi.string().valid('WEB', 'OTP')

export const AuthChannels = Joi.array()
  .items(ConsentRequestChannelType)
  .min(1)
  .max(256)
  .required()

export const AccountAddress = Joi.string()
  .pattern(/^([0-9A-Za-z_~\-\.]+[0-9A-Za-z_~\-])$/)
  .min(1)
  .max(1023)
  .required()

export const ScopeAction = Joi.string().valid(
  'ACCOUNTS_GET_BALANCE',
  'ACCOUNTS_TRANSFER',
  'ACCOUNTS_STATEMENT'
)

export const Scope = Joi.object({
  address: AccountAddress,
  actions: Joi.array().items(ScopeAction).min(1).max(32).required()
})

export const FIDOCredentialId = Joi.string().min(59).max(118)
export const FIDOClientDataJSON = Joi.string().min(121).max(512).required()
export const FIDOPublicKeyType = Joi.string().valid('public-key').required()

export const ErrorCode = Joi.string().pattern(/^[1-9]\d{3}$/)
export const ErrorDescription = Joi.string().min(1).max(128)

export const ErrorInformation = Joi.object({
  errorCode: ErrorCode.required(),
  errorDescription: ErrorDescription.required(),
  extensionList: ExtensionList.optional()
})
