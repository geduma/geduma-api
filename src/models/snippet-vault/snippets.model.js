import mongoose from 'mongoose'
import { conn } from '../db-config.js'

const snippetSchema = mongoose.Schema({
  group: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: String,
    required: false
  },
  snippetValue: {
    type: String,
    required: true
  }
})

export default conn.snippetVaultConn.model('snippets', snippetSchema)
