import gnotesModel from '../models/gnotes.model.js'

const getAll = () => {
  return gnotesModel.find().sort({ updated: -1 })
}

const search = (q) => {
  const regex = new RegExp(q, 'i')
  return gnotesModel.find({
    $or: [
      { title: regex },
      { body: regex },
      { tags: regex }
    ]
  }).sort({ updated: -1 })
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

const update = async (slug, data) => {
  const note = await gnotesModel.findOne({ slug })
  if (!note) {
    const err = new Error('Note not found')
    err.statusCode = 404
    throw err
  }

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

const remove = async (slug) => {
  await gnotesModel.deleteOne({ slug })
  return { success: true }
}

export const service = { getAll, search, create, update, remove }
