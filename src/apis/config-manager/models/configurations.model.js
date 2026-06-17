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
    required: false
  }
}, { timestamps: true })

configurationsSchema.index({ owner: 1, schema: 1, name: 1 }, { unique: true })

export default conn.configManagerConn.model('configurations', configurationsSchema)
