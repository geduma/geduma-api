import mongoose from 'mongoose'
import { conn } from '../db-config.js'

const archivesSchema = mongoose.Schema({
  schema: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  backupDate: {
    type: Number,
    required: true,
    default: Date.now()
  },
  filePath: {
    type: String,
    required: true
  },
  textMessage: {
    type: String,
    required: false
  },
  screenShotData: {
    type: String,
    required: true
  }
})

export default conn.screenShotBackupConn.model('archives', archivesSchema)
