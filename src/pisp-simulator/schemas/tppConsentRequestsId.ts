import Joi from 'joi'
import { BinaryString, ErrorInformation, ExtensionList, Scope, Uri } from './common'

const scopes = Joi.array().items(Scope).min(1).max(256).required()

const ConsentRequestsIdPutResponseWeb = Joi.object({
  scopes,
  authChannels: Joi.array().items(Joi.string().valid('WEB')).min(1).max(1).required(),
  callbackUri: Uri.required(),
  authUri: Uri.required(),
  extensionList: ExtensionList.optional()
})

const ConsentRequestsIdPutResponseOtp = Joi.object({
  scopes,
  authChannels: Joi.array().items(Joi.string().valid('OTP')).min(1).max(1).required(),
  callbackUri: Uri.optional(),
  extensionList: ExtensionList.optional()
})

export const tppConsentRequestsIdPutParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppConsentRequestsIdPutHeaders = Joi.object({
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

export const tppConsentRequestsIdPutPayload = Joi.alternatives().try(
  ConsentRequestsIdPutResponseWeb,
  ConsentRequestsIdPutResponseOtp
)

export const tppConsentRequestsIdPatchPayload = Joi.object({
  authToken: BinaryString.required(),
  extensionList: ExtensionList.optional()
})

export const tppConsentRequestsIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
