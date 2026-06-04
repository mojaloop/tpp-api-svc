import Joi from 'joi'
import { AccountAddress, Currency, ErrorInformation, ExtensionList, Name } from './common'

const Account = Joi.object({
  accountNickname: Name.required(),
  address: AccountAddress.required(),
  currency: Currency.required()
})

const AccountList = Joi.array().items(Account).min(1).max(256)

export const tppAccountsIdPutParams = Joi.object({
  ID: Joi.string().min(1).required()
})

export const tppAccountsIdPutHeaders = Joi.object({
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

export const tppAccountsIdPutPayload = Joi.object({
  accounts: AccountList.required(),
  extensionList: ExtensionList.optional()
})

export const tppAccountsIdErrorPutPayload = Joi.object({
  errorInformation: ErrorInformation.required()
})
