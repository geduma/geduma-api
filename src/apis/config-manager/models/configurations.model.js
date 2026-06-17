import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const configurationsSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    trim: true
  },
  schema: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  expiration: {
    type: Number,
    required: true
  },
  key: {
    type: Number,
    required: true
  }
}, { timestamps: true })

export default conn.configManagerConn.model('configurations', configurationsSchema)
