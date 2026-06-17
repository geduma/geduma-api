import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const archivesSchema = mongoose.Schema({
  schema: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  backupDate: {
    type: Number,
    required: true,
    default: Date.now
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  textMessage: {
    type: String,
    required: false,
    trim: true
  },
  screenShotData: {
    type: String,
    required: true
  }
}, { timestamps: true })

export default conn.screenShotBackupConn.model('archives', archivesSchema)
