import Joi from 'joi'
import {
  BinaryString,
  CorrelationId,
  DateTime,
  ErrorInformation,
  ExtensionList,
  IlpCondition,
  Money,
  Party,
  TransactionType
} from './common'

export const tppTransactionRequestsHeaders = Joi.object({
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

export const tppTransactionRequestsIdParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppTransactionRequestsIdPutPayload = Joi.object({
  transactionRequestId: CorrelationId,
  challenge: BinaryString,
  transactionId: CorrelationId,
  transferAmount: Money.required(),
  payeeReceiveAmount: Money.required(),
  fees: Money.required(),
  payer: Party.required(),
  payee: Party.required(),
  transactionType: TransactionType.required(),
  condition: IlpCondition.required(),
  expiration: DateTime.required(),
  extensionList: ExtensionList.optional()
})

export const tppTransactionRequestsIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
