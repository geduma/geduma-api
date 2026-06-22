import gnotesModel from '../models/gnotes.model.js'

const getAll = (owner) => {
  const filter = owner ? { owner } : {}
  return gnotesModel.find(filter).sort({ updated: -1 })
}

const search = (q, owner) => {
  const regex = new RegExp(q, 'i')
  const filter = {
    $or: [
      { title: regex },
      { body: regex },
      { tags: regex }
    ]
  }
  if (owner) filter.owner = owner
  return gnotesModel.find(filter).sort({ updated: -1 })
}

const create = async (data) => {
  const exists = await gnotesModel.findOne({ slug: data.slug })
  if (exists) {
    const err = new Error('Slug already exists')
    err.statusCode = 409
    throw err
  }
  return gnotesModel.create(data)
}

const verifyOwnership = (note, owner) => {
  if (!owner) {
    const err = new Error('Owner is required')
    err.statusCode = 400
    throw err
  }
  if (note.owner !== owner) {
    const err = new Error('Forbidden: note owner mismatch')
    err.statusCode = 403
    throw err
  }
}

const update = async (slug, data, owner) => {
  const note = await gnotesModel.findOne({ slug })
  if (!note) {
    const err = new Error('Note not found')
    err.statusCode = 404
    throw err
  }

  verifyOwnership(note, owner)

  if (data.newSlug && data.newSlug !== slug) {
    const conflict = await gnotesModel.findOne({ slug: data.newSlug })
    if (conflict) {
      const err = new Error('New slug already exists')
      err.statusCode = 409
      throw err
    }
    note.slug = data.newSlug
  }

  if (data.title !== undefined) note.title = data.title
  if (data.body !== undefined) note.body = data.body
  if (data.tags !== undefined) note.tags = data.tags
  if (data.updated !== undefined) note.updated = data.updated

  return note.save()
}

const remove = async (slug, owner) => {
  const note = await gnotesModel.findOne({ slug })
  if (!note) return { success: true }

  verifyOwnership(note, owner)

  await gnotesModel.deleteOne({ slug })
  return { success: true }
}

export const service = { getAll, search, create, update, remove }
