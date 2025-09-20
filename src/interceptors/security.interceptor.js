import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/auth.service.js'

const apiNames = {
  'config-manager': '',
  'snippet-vault': '',
  'short-url': process.env.API_SHORT_URL_TOKEN_SECRET
}

const verifyJWT = (req, res, next) => {
  const result = service.verify({
    token: req.headers.authorization,
    apiSecret: apiNames[req.url.split('/')[1]]
  })
  if (result) next()
  else res.status(401).send(generalResponse.error('Unauthorized: invalid or missing token'))
}

export const security = { verifyJWT }
