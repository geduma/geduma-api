import customUrlsShema from '../models/short-url/custom-urls.model.js'

const getByShort = ({ id }) => {
  return customUrlsShema.find({
    shortUrl: id
  })
}

const saveUrl = ({ originUrl, shortUrl }) => {
  return customUrlsShema.create({
    originUrl,
    shortUrl
  })
}

export const service = { getByShort, saveUrl }
