import Joi from 'joi'
import { BinaryString, ExtensionList } from './common'

const AccountAddress = Joi.string()
  .pattern(/^([0-9A-Za-z_~\-\.]+[0-9A-Za-z_~\-])$/)
  .min(1)
  .max(1023)
  .required()

const ScopeAction = Joi.string().valid(
  'ACCOUNTS_GET_BALANCE',
  'ACCOUNTS_TRANSFER',
  'ACCOUNTS_STATEMENT'
)

const Scope = Joi.object({
  address: AccountAddress,
  actions: Joi.array().items(ScopeAction).min(1).max(32).required()
})

const ConsentStatusIssued = Joi.string().valid('ISSUED')
const CredentialType = Joi.string().valid('FIDO', 'GENERIC').required()

const GenericCredential = Joi.object({
  publicKey: BinaryString,
  signature: BinaryString
})

const FIDOPublicKeyCredentialAttestation = Joi.object({
  id: Joi.string().min(59).max(118).required(),
  rawId: Joi.string().min(59).max(118).optional(),
  response: Joi.object({
    clientDataJSON: Joi.string().min(121).max(512).required(),
    attestationObject: Joi.string().min(306).max(2048).required()
  }).required(),
  type: Joi.string().valid('public-key').required()
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
