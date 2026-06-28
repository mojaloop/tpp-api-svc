import Joi from 'joi'
import {
  BinaryString,
  ExtensionList,
  FIDOClientDataJSON,
  FIDOCredentialId,
  FIDOPublicKeyType,
  Scope
} from './common'

const ConsentStatusIssued = Joi.string().valid('ISSUED')
const CredentialType = Joi.string().valid('FIDO', 'GENERIC').required()

const GenericCredential = Joi.object({
  publicKey: BinaryString,
  signature: BinaryString
})

const FIDOPublicKeyCredentialAttestation = Joi.object({
  id: FIDOCredentialId.required(),
  rawId: FIDOCredentialId.optional(),
  response: Joi.object({
    clientDataJSON: FIDOClientDataJSON,
    attestationObject: Joi.string().min(306).max(2048).required()
  }).required(),
  type: FIDOPublicKeyType
})

const SignedCredential = Joi.object({
  credentialType: CredentialType,
  status: Joi.string().valid('PENDING').required(),
  genericPayload: GenericCredential.optional(),
  fidoPayload: FIDOPublicKeyCredentialAttestation.optional()
})

const VerifiedCredential = Joi.object({
  credentialType: CredentialType,
  status: Joi.string().valid('VERIFIED').required(),
  genericPayload: GenericCredential.optional(),
  fidoPayload: FIDOPublicKeyCredentialAttestation.optional()
})

// note: spec leaves genericPayload and fidoPayload both optional with no
// "exactly one" rule, so neither/both currently pass. ask daniel before tightening.
const ConsentsIDPutResponseSigned = Joi.object({
  status: ConsentStatusIssued.optional(),
  scopes: Joi.array().items(Scope).required(),
  credential: SignedCredential.required(),
  extensionList: ExtensionList.optional()
})

const ConsentsIDPutResponseVerified = Joi.object({
  status: ConsentStatusIssued.optional(),
  scopes: Joi.array().items(Scope).required(),
  credential: VerifiedCredential.required(),
  extensionList: ExtensionList.optional()
})

export const tppConsentsIdPutHeaders = Joi.object({
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

export const tppConsentsIdPutPayload = Joi.alternatives().try(
  ConsentsIDPutResponseSigned,
  ConsentsIDPutResponseVerified
)

const CredentialStateValue = Joi.string().valid(
  'RECEIVED',
  'PENDING',
  'COMPLETED',
  'REJECTED',
  'VERIFIED'
)

export const tppConsentsIdPatchHeaders = Joi.object({
  'content-type': Joi.string().required(),
  'content-length': Joi.string().required(),
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

// JSON Merge Patch (RFC7386) per spec 3.5.3: every field optional.
export const tppConsentsIdPatchPayload = Joi.object({
  scopes: Joi.array().items(Scope).optional(),
  consentState: CredentialStateValue.optional(),
  credential: Joi.object().unknown(true).optional(),
  extensionList: ExtensionList.optional()
})
