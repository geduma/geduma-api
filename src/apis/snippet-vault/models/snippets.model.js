import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const snippetSchema = mongoose.Schema({
  group: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: String,
    required: false,
    trim: true
  },
  snippetValue: {
    type: String,
    required: true
  }
}, { timestamps: true })

export default conn.snippetVaultConn.model('snippets', snippetSchema)
