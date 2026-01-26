import { generalResponse } from '../../utils/generalResponse.js'
import { Endpoints } from '../../constants/endpoints.js'
import { security } from '../../interceptors/security.interceptor.js'
import { service } from '../geduma-auth/services/auth.service.js'

export function authRouter (app) {
  const path = '/auth'

  app.get(`${path}`, (req, res) => {
    res.send(generalResponse.ok({
      provider: 'geduma-auth',
      redirect: Endpoints.GEDUMA_AUTH + '?id=12345'
    }))
  })

  app.post(`${path}`, async (req, res) => {
    try {
      const { name, user, key, data } = req.body
      const result = await security.auth({ name, user, key, data })
      res.send(generalResponse.ok(result))
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })

  // app.post(`${path}/set-provider`, security.verify, (req, res) => {
  app.post(`${path}/set-provider`, (req, res) => {
    try {
      const { provider } = req.body
      service.setAuthProvider({ provider })
        .then(data => res.send(generalResponse.ok(data)))
        .catch(error => { throw new Error(error.message) })
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })
}
