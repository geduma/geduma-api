import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const configManagerConn = mongoose.createConnection(process.env.CONFIG_MANAGER_MONGODB_URI)
const snippetVaultConn = mongoose.createConnection(process.env.SNIPPET_VAULT_MONGODB_URI)

export const conn = { configManagerConn, snippetVaultConn }
