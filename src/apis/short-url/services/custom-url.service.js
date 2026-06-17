import customUrlsSchema from '../models/custom-urls.model.js'

const getByShort = ({ id }) => {
  return customUrlsSchema.find({
    shortUrl: id
  })
}

const saveUrl = ({ originUrl, shortUrl }) => {
  return customUrlsSchema.create({
    originUrl,
    shortUrl,
    project: 'default'
  })
}

const saveUrlByProject = ({ originUrl, shortUrl, project }) => {
  return customUrlsSchema.create({
    originUrl,
    shortUrl,
    project
  })
}

export const service = { getByShort, saveUrl, saveUrlByProject }
