import { Constants } from '../../../constants/constants.js'
import { Endpoints } from '../../../constants/endpoints.js'
import { v4 as uuidv4 } from 'uuid'

const setAuthProvider = ({ provider }) => {
  if (!provider) throw new Error('Provider is required')

  const validProvider = Constants.AUTH_PROVIDERS.find(p => p.name === provider)
  const jti = uuidv4()

  return new Promise((resolve) => {
    resolve({
      provider: validProvider.name,
      redirect: Endpoints.GEDUMA_AUTH + `/${jti}`
    })
  })
}

export const service = { setAuthProvider }
