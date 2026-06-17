import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const customUrlsSchema = mongoose.Schema({
  originUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortUrl: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true })

export default conn.shortUrlConn.model('custom-urls', customUrlsSchema)
