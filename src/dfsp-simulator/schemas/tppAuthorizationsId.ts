import Joi from 'joi'
import { BinaryString, ExtensionList } from './common'

const AuthorizationResponseTypeRejected = Joi.string().valid('REJECTED').required()
const AuthorizationResponseTypeAccepted = Joi.string().valid('ACCEPTED').required()

const SignedPayloadTypeFIDO = Joi.string().valid('FIDO').required()
const SignedPayloadTypeGeneric = Joi.string().valid('GENERIC').required()

const FIDOPublicKeyCredentialAssertion = Joi.object({
  id: Joi.string().min(59).max(118).required(),
  rawId: Joi.string().min(59).max(118).required(),
  response: Joi.object({
    authenticatorData: Joi.string().min(49).max(256).required(),
    clientDataJSON: Joi.string().min(121).max(512).required(),
    signature: Joi.string().min(59).max(256).required(),
    userHandle: Joi.string().min(1).max(88).optional()
  }).required(),
  type: Joi.string().valid('public-key').required()
})

const SignedPayloadFIDO = Joi.object({
  signedPayloadType: SignedPayloadTypeFIDO,
  fidoSignedPayload: FIDOPublicKeyCredentialAssertion.required()
})

const SignedPayloadGeneric = Joi.object({
  signedPayloadType: SignedPayloadTypeGeneric,
  genericSignedPayload: BinaryString
})

const TppAuthorizationsIDPutResponseRejected = Joi.object({
  responseType: AuthorizationResponseTypeRejected,
  extensionList: ExtensionList.optional()
})

const TppAuthorizationsIDPutResponseFIDO = Joi.object({
  responseType: AuthorizationResponseTypeAccepted,
  signedPayload: SignedPayloadFIDO.required(),
  extensionList: ExtensionList.optional()
})

const TppAuthorizationsIDPutResponseGeneric = Joi.object({
  responseType: AuthorizationResponseTypeAccepted,
  signedPayload: SignedPayloadGeneric.required(),
  extensionList: ExtensionList.optional()
})

export const tppAuthorizationsIdPutHeaders = Joi.object({
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

export const tppAuthorizationsIdPutPayload = Joi.alternatives().try(
  TppAuthorizationsIDPutResponseRejected,
  TppAuthorizationsIDPutResponseFIDO,
  TppAuthorizationsIDPutResponseGeneric
)
