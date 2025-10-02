import jwt from 'jsonwebtoken'
import { generalResponse } from '../utils/generalResponse.js'

const apiSecrets = {
  'config-manager': '',
  'snippet-vault': process.env.API_SNIPPET_VAULT_TOKEN_SECRET,
  'short-url': process.env.API_SHORT_URL_TOKEN_SECRET,
  'screenshot-backup': process.env.API_SCREENSHOT_BACKUP_TOKEN_SECRET
}

const auth = ({ name, user, key }, { apiKey, apiSecret }) => {
  return new Promise((resolve, reject) => {
    if (key !== apiKey) reject(new Error('invalid or missing api key'))
    resolve({
      token: jwt.sign({
        name,
        user
      }, apiSecret, { expiresIn: '5m' })
    })
  })
}

const verify = (req, res, next) => {
  const result = verifyJWT({
    token: req.headers.authorization,
    apiSecret: apiSecrets[req.url.split('/')[1]]
  })
  if (result) next()
  else res.status(401).send(generalResponse.error('Unauthorized: invalid or missing token'))
}

const verifyJWT = ({ token, apiSecret }) => {
  let res = true
  try {
    if (!token) res = false
    jwt.verify(token.split(' ')[1], apiSecret)
  } catch (error) {
    res = false
  }

  return res
}

export const security = { verify, auth }
