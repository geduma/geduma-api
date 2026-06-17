import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const authConn = mongoose.createConnection(process.env.GEDUMA_AUTH_MONGODB_URI)
const configManagerConn = mongoose.createConnection(process.env.CONFIG_MANAGER_MONGODB_URI)
const snippetVaultConn = mongoose.createConnection(process.env.SNIPPET_VAULT_MONGODB_URI)
const shortUrlConn = mongoose.createConnection(process.env.SHORT_URL_MONGODB_URI)
const screenShotBackupConn = mongoose.createConnection(process.env.SCREENSHOT_BACKUP_MONGODB_URI)

export const conn = { authConn, configManagerConn, snippetVaultConn, shortUrlConn, screenShotBackupConn }
