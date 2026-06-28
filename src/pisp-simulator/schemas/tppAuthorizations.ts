import Joi from 'joi'
import {
  CorrelationId,
  DateTime,
  ErrorInformation,
  ExtensionList,
  Money,
  Party,
  PartyIdInfo,
  TransactionType
} from './common'

export const tppAuthorizationsHeaders = Joi.object({
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

export const tppAuthorizationsPostPayload = Joi.object({
  authorizationRequestId: CorrelationId,
  transactionRequestId: CorrelationId,
  challenge: Joi.string().required(),
  transferAmount: Money.required(),
  payeeReceiveAmount: Money.required(),
  fees: Money.required(),
  payer: PartyIdInfo.required(),
  payee: Party.required(),
  transactionType: TransactionType.required(),
  expiration: DateTime.required(),
  extensionList: ExtensionList.optional()
})

export const tppAuthorizationsIdParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppAuthorizationsIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
