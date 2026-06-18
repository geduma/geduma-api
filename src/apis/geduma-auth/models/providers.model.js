import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const providersSchema = mongoose.Schema({
  providerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    trim: true
  },
  clientSecret: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default conn.authConn.model('providers', providersSchema)
