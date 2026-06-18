import dotenv from 'dotenv'
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid'
import { OAUTH_PROVIDERS } from '../../../constants/oauth-providers.js'
import { getOAuthHandler } from './oauth/index.js'
import ProvidersModel from '../models/providers.model.js'
import AppsModel from '../models/apps.model.js'
import AppProvidersModel from '../models/app-providers.model.js'
import AuthSessionsModel from '../models/auth-sessions.model.js'

dotenv.config()

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

const AUTH_FAILED = 'Authentication failed'

const getProvidersForApp = async (appId) => {
  const app = await AppsModel.findOne({ appId, enabled: true })
  if (!app) return []

  const appProviders = await AppProvidersModel.find({ appId, enabled: true })
  const providerIds = appProviders.map(ap => ap.providerId)

  if (providerIds.length === 0) return []

  const providers = await ProvidersModel.find({ providerId: { $in: providerIds }, enabled: true })
  return providers.map(p => ({
    name: p.name,
    displayName: p.displayName,
    icon: p.icon,
    providerId: p.providerId
  }))
}

const initiateLogin = async ({ appId, provider }) => {
  const app = await AppsModel.findOne({ appId, enabled: true })
  if (!app) throw new Error(AUTH_FAILED)

  const appProvider = await AppProvidersModel.findOne({ appId, providerId: provider, enabled: true })
  if (!appProvider) throw new Error(AUTH_FAILED)

  const providerDoc = await ProvidersModel.findOne({ providerId: provider, enabled: true })
  if (!providerDoc) throw new Error(AUTH_FAILED)

  const oauthConfig = OAUTH_PROVIDERS[providerDoc.name]
  if (!oauthConfig) throw new Error(AUTH_FAILED)

  const state = uuidv4()
  const redirectUri = `${API_BASE_URL}/auth`

  await redis.set(`oauth:state:${state}`, JSON.stringify({
    appId,
    redirectUrl: app.redirectUrl,
    provider: providerDoc.name
  }), { ex: 300 })

  const authUrl = `${oauthConfig.authUrl}?` +
    `client_id=${encodeURIComponent(providerDoc.clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(oauthConfig.scope)}` +
    `&state=${state}` +
    '&response_type=code'

  return { redirect: authUrl }
}

const handleCallback = async ({ code, state }) => {
  const stateKey = `oauth:state:${state}`
  const stateDataRaw = await redis.get(stateKey)
  if (!stateDataRaw) throw new Error('Invalid or expired state')

  await redis.del(stateKey)

  let stateData
  try {
    stateData = typeof stateDataRaw === 'string' ? JSON.parse(stateDataRaw) : stateDataRaw
  } catch (e) {
    throw new Error('Invalid state data')
  }

  const { appId, redirectUrl, provider } = stateData

  const providerDoc = await ProvidersModel.findOne({ name: provider, enabled: true })
  if (!providerDoc) throw new Error(AUTH_FAILED)

  const oauthConfig = OAUTH_PROVIDERS[provider]
  if (!oauthConfig) throw new Error(AUTH_FAILED)

  const redirectUri = `${API_BASE_URL}/auth`

  const handler = getOAuthHandler(provider)
  const userData = await handler.exchangeAndFetch({
    code,
    clientId: providerDoc.clientId,
    clientSecret: providerDoc.clientSecret,
    redirectUri,
    tokenUrl: oauthConfig.tokenUrl,
    userInfoUrl: oauthConfig.userInfoUrl
  })

  const sessionToken = uuidv4()

  await AuthSessionsModel.create({
    sessionToken,
    provider,
    appId,
    email: userData.email,
    displayName: userData.displayName,
    picture: userData.picture,
    rawData: userData.rawData,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  })

  return { redirectUrl, sessionToken }
}

const getSession = async (sessionToken) => {
  const session = await AuthSessionsModel.findOne({ sessionToken })
  if (!session) throw new Error('Session not found or expired')

  const data = {
    email: session.email,
    displayName: session.displayName,
    picture: session.picture,
    provider: session.provider,
    rawData: session.rawData
  }

  await AuthSessionsModel.deleteOne({ sessionToken })

  return data
}

export const service = { getProvidersForApp, initiateLogin, handleCallback, getSession }
