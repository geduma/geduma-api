import mongoose from 'mongoose'
import { conn } from '../../../db.config.js'

const requestLogSchema = mongoose.Schema({
  module: { type: String, required: true, index: true },
  method: String,
  path: String,
  statusCode: Number,
  responseTime: Number,
  ip: String,
  timestamp: { type: Date, default: Date.now, index: { expires: '7d' } }
}, { timestamps: false, collection: 'request_logs' })

export default conn.adminDashboardConn.model('RequestLog', requestLogSchema)
