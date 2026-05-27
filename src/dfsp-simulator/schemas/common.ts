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
