import { generalResponse } from '../../utils/generalResponse.js'
import { service } from '../short-url/services/custom-url.service.js'
import { security } from '../../interceptors/security.interceptor.js'

export function shortUrlRouter (app) {
  const path = '/short-url'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'short-url-api' }))
  })

  app.get(`${path}/:id`, async (req, res) => {
    try {
      const data = await service.getByShort({ id: req.params.id })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/short`, security.verify, async (req, res) => {
    try {
      const shortUrl = Math.random().toString(36).substring(2, 8)
      const data = await service.saveUrl({ originUrl: req.body.url, shortUrl })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/short-by-project`, security.verify, async (req, res) => {
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
