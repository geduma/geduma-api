import cors from 'cors'
import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/gnotes.service.js'
import { security } from '../../interceptors/security.interceptor.js'
import { globalLimiter, readLimiter, writeLimiter } from '../../middleware/rateLimiter.js'

export function gnotesRouter (app) {
  const path = '/gnotes'

  app.use(path, cors({ origin: 'https://notes.geduma.com' }))
  app.use(path, globalLimiter)

  app.get(path, readLimiter(60), security.verify, async (req, res) => {
    try {
      const q = req.query.q
      const owner = req.query.owner
      const data = q ? await service.search(q, owner) : await service.getAll(owner)
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.post(path, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const note = await service.create(req.body)
      res.status(201).send(generalResponse.ok({ success: true, slug: note.slug }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.put(`${path}/:slug`, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const note = await service.update(req.params.slug, req.body, req.body.owner)
      res.send(generalResponse.ok({ success: true, slug: note.slug }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.delete(`${path}/:slug`, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const owner = req.body.owner || req.query.owner
      await service.remove(req.params.slug, owner)
      res.send(generalResponse.ok({ success: true }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })
}
