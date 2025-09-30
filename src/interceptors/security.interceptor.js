import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/auth.service.js'

const apiSecrets = {
  'config-manager': '',
  'snippet-vault': process.env.API_SNIPPET_VAULT_TOKEN_SECRET,
  'short-url': process.env.API_SHORT_URL_TOKEN_SECRET,
  'screenshot-backup': process.env.API_SCREENSHOT_BACKUP_TOKEN_SECRET
}

const verifyJWT = (req, res, next) => {
  const result = service.verify({
    token: req.headers.authorization,
    apiSecret: apiSecrets[req.url.split('/')[1]]
  })
  if (result) next()
  else res.status(401).send(generalResponse.error('Unauthorized: invalid or missing token'))
}

export const security = { verifyJWT }
