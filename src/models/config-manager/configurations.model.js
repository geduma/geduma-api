import mongoose from 'mongoose'
import { conn } from '../db-config.js'

const configurationsSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  schema: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  expiration: {
    type: Number,
    required: true
  },
  key: {
    type: Number,
    required: true
  }
})

export default conn.configManagerConn.model('configurations', configurationsSchema)
