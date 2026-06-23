import gpassModel from '../models/gpass.model.js'

const requireOwner = (owner) => {
  if (!owner) {
    const err = new Error('Owner query param is required')
    err.statusCode = 400
    throw err
  }
}

const getAll = (owner, q) => {
  requireOwner(owner)
  const filter = { owner }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ]
  }

  return gpassModel.find(filter).sort({ updatedAt: -1 })
}

const getById = (id, owner) => {
  requireOwner(owner)
  return gpassModel.findOne({ _id: id, owner })
}

const create = (data) => {
  return gpassModel.create(data)
}

const verifyOwnership = (doc, owner) => {
  if (!owner) {
    const err = new Error('Owner is required')
    err.statusCode = 400
    throw err
  }
  if (doc.owner !== owner) {
    const err = new Error('Forbidden: owner mismatch')
    err.statusCode = 403
    throw err
  }
}

const update = async (id, data, owner) => {
  const doc = await gpassModel.findById(id)
  if (!doc) {
    const err = new Error('Entry not found')
    err.statusCode = 404
    throw err
  }

  verifyOwnership(doc, owner)

  const allowed = ['title', 'username', 'password', 'strength', 'encrypted', 'iv', 'tags']
  const updates = {}
  for (const field of allowed) {
    if (data[field] !== undefined) {
      updates[field] = data[field]
    }
  }

  const updated = await gpassModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
  return updated
}

const remove = async (id, owner) => {
  const doc = await gpassModel.findById(id)
  if (!doc) return { success: true }

  verifyOwnership(doc, owner)

  await gpassModel.deleteOne({ _id: id })
  return { success: true }
}

export const service = { getAll, getById, create, update, remove }
