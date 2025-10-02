import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const customUrlsSchema = mongoose.Schema({
  originUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  }
})

export default conn.shortUrlConn.model('custom-urls', customUrlsSchema)
