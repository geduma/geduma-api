import { generalResponse } from '../../utils/generalResponse.js'
import { service } from '../short-url/services/custom-url.service.js'
import { security } from '../../interceptors/security.interceptor.js'
import { globalLimiter, readLimiter, writeLimiter } from '../../middleware/rateLimiter.js'

export function shortUrlRouter (app) {
  const path = '/short-url'
  app.use(path, globalLimiter)

  app.get(`${path}/`, readLimiter(120), (_, res) => {
    res.send(generalResponse.ok({ message: 'short-url-api' }))
  })

  app.get(`${path}/:id`, readLimiter(120), async (req, res) => {
    try {
      const data = await service.getByShort({ id: req.params.id })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/short`, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const shortUrl = Math.random().toString(36).substring(2, 8)
      const data = await service.saveUrl({ originUrl: req.body.url, shortUrl })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/short-by-project`, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const shortUrl = Math.random().toString(36).substring(2, 8)
      const data = await service.saveUrlByProject({ originUrl: req.body.url, shortUrl, project: req.body.project })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })
}
