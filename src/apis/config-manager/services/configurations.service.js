import configurationsSchema from '../models/configurations.model.js'

const getAll = () => {
  return configurationsSchema.find()
}

const getByOwner = ({ ownerStr }) => {
  return configurationsSchema.find({
    owner: ownerStr
  })
}

const getBySchema = ({ ownerStr, schemaStr }) => {
  return configurationsSchema.find({
    owner: ownerStr,
    schema: schemaStr
  })
}

const getByName = ({ ownerStr, schemaStr, nameStr }) => {
  return configurationsSchema.find({
    owner: ownerStr,
    schema: schemaStr,
    name: nameStr
  })
}

const create = ({ owner, schema, name, value, expiration }) => {
  const key = Math.floor(Date.now() / 1000)
  return configurationsSchema.create({ owner, schema, name, value, expiration, key })
}

const update = ({ ownerStr, schemaStr, nameStr, value, expiration }) => {
  return configurationsSchema.findOneAndUpdate(
    { owner: ownerStr, schema: schemaStr, name: nameStr },
    { $set: { value, expiration } },
    { new: true }
  )
}

const remove = ({ ownerStr, schemaStr, nameStr }) => {
  return configurationsSchema.findOneAndDelete(
    { owner: ownerStr, schema: schemaStr, name: nameStr }
  )
}

export const service = { getAll, getByOwner, getBySchema, getByName, create, update, remove }
