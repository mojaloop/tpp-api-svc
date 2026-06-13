import Joi from 'joi'
import {
  AuthenticationType,
  CorrelationId,
  DateTime,
  ExtensionList,
  Money,
  Note,
  Party,
  PartyIdInfo,
  TransactionType
} from './common'

export const tppTransactionRequestsPostHeaders = Joi.object({
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

export const tppTransactionRequestsPostPayload = Joi.object({
  transactionRequestId: CorrelationId,
  payee: Party.required(),
  payer: PartyIdInfo.required(),
  amount: Money.required(),
  transactionType: TransactionType.required(),
  note: Note.optional(),
  authenticationType: AuthenticationType.optional(),
  expiration: DateTime.optional(),
  extensionList: ExtensionList.optional()
})

export const tppTransactionRequestsIdGetHeaders = Joi.object({
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

export const tppTransactionRequestsIdGetParams = Joi.object({
  ID: Joi.string().min(1).required()
})
