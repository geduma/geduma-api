import gnoteModel from '../models/gnote.model.js'

const getAll = () => {
  return gnoteModel.find().sort({ updated: -1 })
}

const search = (q) => {
  const regex = new RegExp(q, 'i')
  return gnoteModel.find({
    $or: [
      { title: regex },
      { body: regex },
      { tags: regex }
    ]
  }).sort({ updated: -1 })
}

const create = async (data) => {
  const exists = await gnoteModel.findOne({ slug: data.slug })
  if (exists) {
    const err = new Error('Slug already exists')
    err.statusCode = 409
    throw err
  }
  return gnoteModel.create(data)
}

const update = async (slug, data) => {
  const note = await gnoteModel.findOne({ slug })
  if (!note) {
    const err = new Error('Note not found')
    err.statusCode = 404
    throw err
  }

  if (data.newSlug && data.newSlug !== slug) {
    const conflict = await gnoteModel.findOne({ slug: data.newSlug })
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
  await gnoteModel.deleteOne({ slug })
  return { success: true }
}

export const service = { getAll, search, create, update, remove }
