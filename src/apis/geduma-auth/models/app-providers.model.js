import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const appProvidersSchema = mongoose.Schema({
  appId: {
    type: String,
    required: true,
    trim: true
  },
  providerId: {
    type: String,
    required: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

appProvidersSchema.index({ appId: 1, providerId: 1 }, { unique: true })

export default conn.authConn.model('app-providers', appProvidersSchema)
