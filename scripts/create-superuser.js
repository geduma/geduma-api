/*
  USO:
  node scripts/create-superuser.js <email>

  Crea o actualiza un usuario en allowed_users con appId='0' y superuser=true.
  Este usuario tendrá acceso a todas las apps del sistema, incluyendo el admin dashboard.

  Ejemplo:
  node scripts/create-superuser.js gedumarino@gmail.com
*/

import mongoose from 'mongoose'
import crypto from 'crypto'

const email = process.argv[2]
if (!email) {
  console.error('❌ Usage: node scripts/create-superuser.js <email>')
  process.exit(1)
}

const GEDUMA_AUTH_MONGODB_URI = process.env.GEDUMA_AUTH_MONGODB_URI

if (!GEDUMA_AUTH_MONGODB_URI) {
  console.error('❌ GEDUMA_AUTH_MONGODB_URI environment variable is required')
  process.exit(1)
}

const allowedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  appId: { type: String, required: true, trim: true },
  enabled: { type: Boolean, default: true },
  superuser: { type: Boolean, default: false },
  salt: { type: String, required: true }
}, { timestamps: true, collection: 'allowed_users' })

allowedUserSchema.index({ email: 1, appId: 1 }, { unique: true })

async function main () {
  const conn = mongoose.createConnection(GEDUMA_AUTH_MONGODB_URI)

  conn.once('open', async () => {
    const AllowedUser = conn.model('AllowedUser', allowedUserSchema)

    const salt = crypto.randomBytes(16).toString('base64')

    const result = await AllowedUser.updateOne(
      { email: email.toLowerCase().trim(), appId: '0' },
      { $set: { email: email.toLowerCase().trim(), appId: '0', enabled: true, superuser: true, salt } },
      { upsert: true }
    )

    if (result.upsertedCount > 0) {
      console.log(`✅ Superuser created: ${email}`)
    } else if (result.modifiedCount > 0) {
      console.log(`✅ Superuser updated: ${email}`)
    } else {
      console.log(`ℹ️  Superuser already exists: ${email}`)
    }

    await conn.close()
    process.exit(0)
  })

  conn.on('error', (err) => {
    console.error('❌ Connection error:', err.message)
    process.exit(1)
  })
}

main()
