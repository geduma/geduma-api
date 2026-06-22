import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const gnoteSchema = mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  updated: {
    type: String,
    required: true,
    trim: true
  }
})

export default conn.gnoteConn.model('gnotes', gnoteSchema)
