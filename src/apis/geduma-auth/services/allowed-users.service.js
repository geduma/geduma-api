import crypto from 'crypto'
import allowedUsersModel from '../models/allowed-users.model.js'

const find = async (email, appId) => {
  if (!email || !appId) return null
  return allowedUsersModel.findOne({ email, appId, enabled: true })
}

const create = async ({ email, appId }) => {
  const salt = crypto.randomBytes(16).toString('base64')
  return allowedUsersModel.create({ email, appId, enabled: true, salt })
}

export const allowedService = { find, create }
