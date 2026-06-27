import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const allowedUserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  appId: {
    type: String,
    required: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  salt: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'allowed_users' })

allowedUserSchema.index({ email: 1, appId: 1 }, { unique: true })

export default conn.authConn.model('allowedUsers', allowedUserSchema)
