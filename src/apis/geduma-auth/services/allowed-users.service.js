import crypto from 'crypto'
import allowedUsersModel from '../models/allowed-users.model.js'

const SUPERUSER_APP_ID = '0'

const find = async (email, appId) => {
  if (!email || !appId) return null

  let user = await allowedUsersModel.findOne({ email, appId, enabled: true })
  if (user) return user

  user = await allowedUsersModel.findOne({ email, appId: SUPERUSER_APP_ID, enabled: true, superuser: true })
  return user
}

const create = async ({ email, appId }) => {
  const salt = crypto.randomBytes(16).toString('base64')
  return allowedUsersModel.create({ email, appId, enabled: true, salt })
}

export const allowedService = { find, create }
