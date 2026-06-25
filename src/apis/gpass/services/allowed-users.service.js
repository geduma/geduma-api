import allowedUsersModel from '../models/allowed-users.model.js'

const isAllowed = async (email) => {
  if (!email) return false
  const user = await allowedUsersModel.findOne({ email, enabled: true })
  return !!user
}

export const allowedService = { isAllowed }
