import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { generalResponse } from '../utils/generalResponse.js'

dotenv.config()

const apiKeys = {
  'config-manager': null,
  'snippet-vault': process.env.API_SNIPPET_VAULT_KEY,
  'short-url': process.env.API_SHORT_URL_KEY,
  'screenshot-backup': process.env.API_SCREENSHOT_BACKUP_KEY
}

const apiSecrets = {
  'config-manager': null,
  'snippet-vault': process.env.API_SNIPPET_VAULT_TOKEN_SECRET,
  'short-url': process.env.API_SHORT_URL_TOKEN_SECRET,
  'screenshot-backup': process.env.API_SCREENSHOT_BACKUP_TOKEN_SECRET
}

const auth = ({ name, user, key, data = { user } }) => {
  const jti = uuidv4()
  return new Promise((resolve, reject) => {
    if (key !== apiKeys[name]) reject(Error('invalid or missing api key'))
    resolve({
      token: jwt.sign({
        data,
        jti
      }, apiSecrets[name], { expiresIn: '5m' })
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
    // if (usedTokens.has(decode.jti)) throw new Error('token already used')
  } catch (error) {
    res = false
  }

  return res
}

export const security = { verify, auth }
