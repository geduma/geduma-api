import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const authSessionsSchema = mongoose.Schema({
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  appId: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true })

authSessionsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default conn.authConn.model('auth-sessions', authSessionsSchema)
