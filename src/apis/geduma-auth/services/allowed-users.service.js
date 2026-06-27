import allowedUsersModel from '../models/allowed-users.model.js'

const isAllowed = async (email, appId) => {
  if (!email || !appId) return false
  const user = await allowedUsersModel.findOne({ email, appId, enabled: true })
  return !!user
}

export const allowedService = { isAllowed }
