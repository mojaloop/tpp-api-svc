import Joi from 'joi'

export const BinaryString = Joi.string()
  .pattern(/^[A-Za-z0-9-_]+[=]{0,2}$/)
  .required()

const ExtensionKey = Joi.string().min(1).max(32).required()
const ExtensionValue = Joi.string().min(1).max(128).required()

const Extension = Joi.object({
  key: ExtensionKey,
  value: ExtensionValue
})

export const ExtensionList = Joi.object({
  extension: Joi.array().items(Extension).min(1).max(16).required()
})

export const CorrelationId = Joi.string()
  .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  .required()

export const Uri = Joi.string()
  .pattern(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
  .min(1)
  .max(512)
  .required()

export const PartyIdentifier = Joi.string().min(1).max(128).required()

export const ConsentRequestChannelType = Joi.string().valid('WEB', 'OTP')

export const AuthChannels = Joi.array()
  .items(ConsentRequestChannelType)
  .min(1)
  .max(256)
  .required()

export const AccountAddress = Joi.string()
  .pattern(/^([0-9A-Za-z_~\-\.]+[0-9A-Za-z_~\-])$/)
  .min(1)
  .max(1023)
  .required()

export const ScopeAction = Joi.string().valid(
  'ACCOUNTS_GET_BALANCE',
  'ACCOUNTS_TRANSFER',
  'ACCOUNTS_STATEMENT'
)

export const Scope = Joi.object({
  address: AccountAddress,
  actions: Joi.array().items(ScopeAction).min(1).max(32).required()
})

export const FIDOCredentialId = Joi.string().min(59).max(118)
export const FIDOClientDataJSON = Joi.string().min(121).max(512).required()
export const FIDOPublicKeyType = Joi.string().valid('public-key').required()

export const Name = Joi.string().pattern(/^(?!\s*$)[\w .,'-]{1,128}$/)

export const Currency = Joi.string().valid(
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
  'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GGP', 'GHS',
  'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF',
  'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD',
  'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT',
  'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
  'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
  'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK',
  'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
  'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SPL', 'SRD',
  'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
  'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'XTS', 'XXX',
  'YER', 'ZAR', 'ZMW', 'ZWD'
)

export const PartyIdType = Joi.string().valid(
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
)

export const PartySubIdOrType = Joi.string().min(1).max(128)
export const FspId = Joi.string().min(1).max(32)

export const PartyIdInfo = Joi.object({
  partyIdType: PartyIdType.required(),
  partyIdentifier: PartyIdentifier,
  partySubIdOrType: PartySubIdOrType.optional(),
  fspId: FspId.optional(),
  extensionList: ExtensionList.optional()
})

export const MerchantClassificationCode = Joi.string().pattern(/^[\d]{1,4}$/)

const PartyNamePattern = /^(?!\s*$)[\p{L}\p{gc=Mark}\p{digit}\p{gc=Connector_Punctuation}\p{Join_Control} .,'-]{1,128}$/u
export const FirstName = Joi.string().min(1).max(128).pattern(PartyNamePattern)
export const MiddleName = Joi.string().min(1).max(128).pattern(PartyNamePattern)
export const LastName = Joi.string().min(1).max(128).pattern(PartyNamePattern)

export const PartyComplexName = Joi.object({
  firstName: FirstName.optional(),
  middleName: MiddleName.optional(),
  lastName: LastName.optional()
})

export const DateOfBirth = Joi.string().pattern(
  /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)$/
)

export const KYCInformation = Joi.string().min(1).max(2048)

export const PartyPersonalInfo = Joi.object({
  complexName: PartyComplexName.optional(),
  dateOfBirth: DateOfBirth.optional(),
  kycInformation: KYCInformation.optional()
})

export const PartyName = Joi.string().min(1).max(128)

export const Account = Joi.object({
  address: AccountAddress.optional(),
  currency: Currency.required(),
  accountNickname: Name.optional()
})

export const AccountList = Joi.array().items(Account).min(1)

export const Party = Joi.object({
  partyIdInfo: PartyIdInfo.required(),
  merchantClassificationCode: MerchantClassificationCode.optional(),
  name: PartyName.optional(),
  personalInfo: PartyPersonalInfo.optional(),
  accounts: AccountList.optional()
})

export const Amount = Joi.string().pattern(/^([0]|([1-9][0-9]{0,17}))([.][0-9]{0,3}[1-9])?$/)

export const Money = Joi.object({
  currency: Currency.required(),
  amount: Amount.required()
})

export const DateTime = Joi.string().pattern(
  /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:(\.\d{3}))(?:Z|[+-][01]\d:[0-5]\d)$/
)

export const TransactionScenario = Joi.string().valid(
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER',
  'PAYMENT',
  'REFUND'
)
export const TransactionSubScenario = Joi.string().pattern(/^[A-Z_]{1,32}$/)
export const TransactionInitiator = Joi.string().valid('PAYER', 'PAYEE')
export const TransactionInitiatorType = Joi.string().valid('CONSUMER', 'AGENT', 'BUSINESS', 'DEVICE')
export const RefundReason = Joi.string().min(1).max(128)

export const Refund = Joi.object({
  originalTransactionId: CorrelationId,
  refundReason: RefundReason.optional()
})

export const BalanceOfPayments = Joi.string().pattern(/^[1-9]\d{2}$/)

export const TransactionType = Joi.object({
  scenario: TransactionScenario.required(),
  subScenario: TransactionSubScenario.optional(),
  initiator: TransactionInitiator.required(),
  initiatorType: TransactionInitiatorType.required(),
  refundInfo: Refund.optional(),
  balanceOfPayments: BalanceOfPayments.optional()
})

export const AuthenticationType = Joi.string().valid('OTP', 'FIDO', 'QRCODE')

export const Note = Joi.string().min(1).max(128)

export const ErrorCode = Joi.string().pattern(/^[1-9]\d{3}$/)
export const ErrorDescription = Joi.string().min(1).max(128)

export const ErrorInformation = Joi.object({
  errorCode: ErrorCode.required(),
  errorDescription: ErrorDescription.required(),
  extensionList: ExtensionList.optional()
})

export const ErrorInformationObject = Joi.object({
  errorInformation: ErrorInformation.required()
})
