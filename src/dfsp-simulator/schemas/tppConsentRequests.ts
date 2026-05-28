import Joi from 'joi'
import { ExtensionList } from './common'

const CorrelationId = Joi.string()
  .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  .required()

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

const PartyIdentifier = Joi.string().min(1).max(128).required()
const PartySubIdOrType = Joi.string().min(1).max(128).optional()
const FspId = Joi.string().min(1).max(32).optional()

const PartyIdInfo = Joi.object({
  partyIdType: PartyIdType,
  partyIdentifier: PartyIdentifier,
  partySubIdOrType: PartySubIdOrType,
  fspId: FspId,
  extensionList: ExtensionList.optional()
}).required()

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

const Scopes = Joi.array().items(Scope).min(1).max(256).required()

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
