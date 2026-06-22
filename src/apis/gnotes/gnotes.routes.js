import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/gnotes.service.js'
import { security } from '../../interceptors/security.interceptor.js'

export function gnotesRouter (app) {
  const path = '/gnotes'

  app.get(path, security.verify, async (req, res) => {
    try {
      const q = req.query.q
      const data = q ? await service.search(q) : await service.getAll()
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.post(path, security.verify, async (req, res) => {
    try {
      const note = await service.create(req.body)
      res.status(201).send(generalResponse.ok({ success: true, slug: note.slug }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.put(`${path}/:slug`, security.verify, async (req, res) => {
    try {
      const note = await service.update(req.params.slug, req.body)
      res.send(generalResponse.ok({ success: true, slug: note.slug }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.delete(`${path}/:slug`, security.verify, async (req, res) => {
    try {
      await service.remove(req.params.slug)
      res.send(generalResponse.ok({ success: true }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })
}
