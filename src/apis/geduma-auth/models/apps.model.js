import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const appsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  appId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default conn.authConn.model('apps', appsSchema)
