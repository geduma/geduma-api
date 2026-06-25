import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const allowedUserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, collection: 'allowed_users' })

export default conn.gpassConn.model('allowedUsers', allowedUserSchema)
