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

export const service = { getAll, getByOwner, getBySchema, getByName }
