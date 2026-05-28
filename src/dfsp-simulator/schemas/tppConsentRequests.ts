import Joi from 'joi'
import {
  AuthChannels,
  CorrelationId,
  ExtensionList,
  PartyIdentifier,
  Scope,
  Uri
} from './common'

const PartyIdType = Joi.string().valid(
  'MSISDN',
  'EMAIL',
  'PERSONAL_ID',
  'BUSINESS',
  'DEVICE',
  'ACCOUNT_ID',
  'IBAN',
  'ALIAS',
  'CONSENT',
  'THIRD_PARTY_LINK'
).required()

const PartySubIdOrType = Joi.string().min(1).max(128).optional()
const FspId = Joi.string().min(1).max(32).optional()

const PartyIdInfo = Joi.object({
  partyIdType: PartyIdType,
  partyIdentifier: PartyIdentifier,
  partySubIdOrType: PartySubIdOrType,
  fspId: FspId,
  extensionList: ExtensionList.optional()
}).required()

const Scopes = Joi.array().items(Scope).min(1).max(256).required()

export const tppConsentRequestsPostHeaders = Joi.object({
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

export const tppConsentRequestsPostPayload = Joi.object({
  consentRequestId: CorrelationId,
  partyIdInfo: PartyIdInfo,
  scopes: Scopes,
  authChannels: AuthChannels,
  callbackUri: Uri,
  extensionList: ExtensionList.optional()
})
