import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Redis } from '@upstash/redis'
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

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const auth = ({ name, user, key, data = { user } }) => {
  const jti = uuidv4()
  return new Promise((resolve, reject) => {
    if (key !== apiKeys[name]) reject(Error('invalid or missing api key'))
    const token = jwt.sign({
      data,
      jti
    }, apiSecrets[name], { expiresIn: '5m' })

    redis.set(jti, token)
      .then(() => resolve({ token }))
  })
}

const verify = (req, res, next) => {
  const token = req.headers.authorization
  verifyJWT({
    token,
    apiSecret: apiSecrets[req.url.split('/')[1]]
  }).then((valid) => {
    if (valid) {
      redis.del(jwt.decode(token.split(' ')[1]).jti)
        .then(() => next())
    } else res.status(401).send(generalResponse.error('Unauthorized: invalid or missing token'))
  })
}

const verifyJWT = async ({ token, apiSecret }) => {
  let res = true
  const jwtDecoded = jwt.decode(token.split(' ')[1])
  const storedToken = await redis.get(jwtDecoded.jti)

  try {
    if (!token) res = false
    if (!storedToken) res = false

    jwt.verify(token.split(' ')[1], apiSecret)
  } catch (error) {
    res = false
  }

  return res
}

export const security = { verify, auth }
