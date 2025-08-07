import customUrlsShema from '../models/short-url/custom-urls.model.js'

const getByShort = ({ id }) => {
  return customUrlsShema.find({
    shortUrl: id
  })
}

const saveUrl = ({ originUrl, shortUrl }) => {
  return customUrlsShema.create({
    originUrl,
    shortUrl,
    project: 'default'
  })
}

const saveUrlByProject = ({ originUrl, shortUrl, project }) => {
  return customUrlsShema.create({
    originUrl,
    shortUrl,
    project
  })
}

export const service = { getByShort, saveUrl, saveUrlByProject }
