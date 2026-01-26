import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const authProviderSchema = mongoose.Schema({
  provider: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  setAt: {
    type: Number,
    required: true,
    default: Date.now()
  },
  token: {
    type: String,
    required: true
  }
})

export default conn.authConn.model('auth-provider', authProviderSchema)
