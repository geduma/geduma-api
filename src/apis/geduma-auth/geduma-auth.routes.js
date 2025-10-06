import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'

export function authRouter (app) {
  const path = '/auth'

  app.post(`${path}`, async (req, res) => {
    try {
      const { name, user, key, data } = req.body
      const result = await security.auth({ name, user, key, data })
      res.send(generalResponse.ok(result))
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })
}
