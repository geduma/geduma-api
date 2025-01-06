import snippetsSchema from '../models/snippet-vault/snippets.model.js'

const getAll = () => {
  return snippetsSchema.find()
}

export const service = { getAll }
