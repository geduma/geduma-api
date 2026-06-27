/*
  USO:
  1. Abrir MongoDB Compass → conectar a la DB de geduma-auth
  2. Ir a "MongoSH Shell" (no al playground)
  3. Copiar y pegar TODO el contenido

  O desde terminal:
  mongosh "mongodb+srv://..." --file scripts/insert-allowed-user.mongodb.js

  EDITAR: email, appId y enabled según corresponda
*/

function base64(bytes) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let r = '', i = 0
  while (i < bytes.length) {
    const a = bytes[i++], b = bytes[i++] || 0, d = bytes[i++] || 0
    r += c[a >> 2] + c[((a & 3) << 4) | (b >> 4)] + c[((b & 15) << 2) | (d >> 6)] + c[d & 63]
  }
  return r.slice(0, -(bytes.length % 3 || 3)) + (bytes.length % 3 ? (3 - bytes.length % 3) === 1 ? '=' : '==' : '')
}

const salt = base64(Array.from({length: 16}, () => Math.floor(Math.random() * 256)))

db.allowed_users.insertOne({
  email: 'gedumarino@gmail.com',
  appId: 'app_8k3m9p2w1v6n',
  enabled: false,
  salt
})
