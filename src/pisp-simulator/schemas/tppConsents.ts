import Joi from 'joi'
import {
  BinaryString,
  CorrelationId,
  ExtensionList,
  FIDOClientDataJSON,
  FIDOCredentialId,
  FIDOPublicKeyType,
  Scope
} from './common'

const scopes = Joi.array().items(Scope).min(1).max(256).required()

const ConsentStatus = Joi.string().valid('ISSUED', 'REVOKED')

const GenericCredential = Joi.object({
  publicKey: BinaryString,
  signature: BinaryString
})

const FIDOAttestationResponse = Joi.object({
  clientDataJSON: FIDOClientDataJSON,
  attestationObject: Joi.string().min(306).max(2048).required()
})

const FIDOPublicKeyCredentialAttestation = Joi.object({
  id: FIDOCredentialId.required(),
  rawId: FIDOCredentialId.optional(),
  response: FIDOAttestationResponse.required(),
  type: FIDOPublicKeyType
})

const SignedCredential = Joi.object({
  credentialType: Joi.string().valid('FIDO', 'GENERIC').required(),
  status: Joi.string().valid('PENDING').required(),
  genericPayload: GenericCredential.optional(),
  fidoPayload: FIDOPublicKeyCredentialAttestation.optional()
})

const ConsentsPostRequestAuth = Joi.object({
  consentId: CorrelationId,
  consentRequestId: CorrelationId.optional(),
  scopes,
  credential: SignedCredential.required(),
  status: ConsentStatus.required(),
  extensionList: ExtensionList.optional()
})

const ConsentsPostRequestPisp = Joi.object({
  consentId: CorrelationId,
  consentRequestId: CorrelationId,
  scopes,
  status: ConsentStatus.required(),
  extensionList: ExtensionList.optional()
})

export const tppConsentsHeaders = Joi.object({
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

export const tppConsentsPostPayload = Joi.alternatives().try(
  ConsentsPostRequestAuth,
  ConsentsPostRequestPisp
)

export const tppConsentsIdGetParams = Joi.object({
  ID: Joi.string().min(1).required()
})
