import mongoose from 'mongoose'
import gpassModel from '../models/gpass.model.js'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid entry ID')
    err.statusCode = 400
    throw err
  }
}

const ALLOWED_FIELDS = ['title', 'username', 'password', 'strength', 'encrypted', 'iv', 'owner', 'tags']

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
    const sanitized = escapeRegex(q)
    filter.$or = [
      { title: { $regex: sanitized, $options: 'i' } },
      { username: { $regex: sanitized, $options: 'i' } },
      { tags: { $regex: sanitized, $options: 'i' } }
    ]
  }

  return gpassModel.find(filter).sort({ updatedAt: -1 })
}

const getById = (id, owner) => {
  requireOwner(owner)
  validateObjectId(id)
  return gpassModel.findOne({ _id: id, owner })
}

const create = (data) => {
  const entry = {}
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) {
      entry[field] = data[field]
    }
  }
  return gpassModel.create(entry)
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
  validateObjectId(id)

  const doc = await gpassModel.findById(id)
  if (!doc) {
    const err = new Error('Entry not found')
    err.statusCode = 404
    throw err
  }

  verifyOwnership(doc, owner)

  const updates = {}
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) {
      updates[field] = data[field]
    }
  }

  const updated = await gpassModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
  return updated
}

const remove = async (id, owner) => {
  validateObjectId(id)

  const doc = await gpassModel.findById(id)
  if (!doc) return { success: true }

  verifyOwnership(doc, owner)

  await gpassModel.deleteOne({ _id: id })
  return { success: true }
}

export const service = { getAll, getById, create, update, remove }
