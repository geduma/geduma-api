import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/short-url.service.js'
import { service as authService } from '../services/auth.service.js'
import { security } from '../interceptors/security.interceptor.js'

export function shortUrlRouter (app) {
  const path = '/short-url'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'short-url-api' }))
  })

  app.post(`${path}/auth`, async (req, res) => {
    try {
      const { name, user, key } = req.body
      const data = await authService.auth({ name, user, key }, { apiKey: process.env.API_SHORT_URL_KEY, apiSecret: process.env.API_SHORT_URL_TOKEN_SECRET })
      res.send(generalResponse.ok(data))
    } catch (error) {
      console.error(error)
      res.status(400).send(generalResponse.error(error))
    }
  })

  app.get(`${path}/:id`, security.verifyJWT, (req, res) => {
    service.getByShort({ id: req.params.id })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/short`, security.verifyJWT, (req, res) => {
    const shortUrl = Math.random()
      .toString(36)
      .substr(2, 6)

    service.saveUrl({ originUrl: req.body.url, shortUrl })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })
}
