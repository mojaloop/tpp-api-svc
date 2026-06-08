import Joi from 'joi'
import {
  AuthenticationInfo,
  CorrelationId,
  DateTime,
  ErrorInformation,
  ExtensionList,
  IlpFulfilment,
  TransferState
} from './common'

export const tppTransfersHeaders = Joi.object({
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

export const tppTransfersIdParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppTransfersPostPayload = Joi.object({
  executionRequestId: CorrelationId,
  transactionRequestId: CorrelationId,
  authenticationInfo: AuthenticationInfo.optional(),
  extensionList: ExtensionList.optional()
})

export const tppTransfersIdPutPayload = Joi.object({
  fulfilment: IlpFulfilment.optional(),
  completedTimestamp: DateTime.optional(),
  transferState: TransferState.required(),
  extensionList: ExtensionList.optional()
})

export const tppTransfersIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
