import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const gpassSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  strength: {
    type: String,
    required: true,
    enum: ['strong', 'weak', 'compromised']
  },
  encrypted: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  compromised: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default conn.gpassConn.model('gpass', gpassSchema)
