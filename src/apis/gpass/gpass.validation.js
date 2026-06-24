import Joi from 'joi'

const stringOrNull = Joi.string().trim().allow('').allow(null)
const arrayOfStrings = Joi.array().items(Joi.string().trim()).default([])

export const createSchema = Joi.object({
  title: Joi.string().trim().required(),
  username: stringOrNull,
  password: Joi.string().required(),
  strength: Joi.string().valid('strong', 'medium', 'weak').required(),
  encrypted: Joi.string().required(),
  iv: Joi.string().required(),
  owner: Joi.string().trim().required(),
  tags: arrayOfStrings
})

export const updateSchema = Joi.object({
  title: Joi.string().trim(),
  username: stringOrNull,
  password: Joi.string(),
  strength: Joi.string().valid('strong', 'medium', 'weak'),
  encrypted: Joi.string(),
  iv: Joi.string(),
  owner: Joi.string().trim(),
  tags: arrayOfStrings
}).min(1).message('At least one field must be provided for update')
