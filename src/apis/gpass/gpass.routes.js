import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/gpass.service.js'
import { security } from '../../interceptors/security.interceptor.js'

export function gpassRouter (app) {
  const path = '/gpass'

  app.use(path, cors({ origin: 'https://gpass.geduma.com' }))

  const gpassLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, msg: 'Too many requests, please try again later', data: [] }
  })
  app.use(path, gpassLimiter)

  app.get(path, security.verify, async (req, res) => {
    try {
      const owner = req.query.owner
      const q = req.query.q
      const data = await service.getAll(owner, q)
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/:id`, security.verify, async (req, res) => {
    try {
      const owner = req.query.owner
      const data = await service.getById(req.params.id, owner)
      if (!data) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.post(path, security.verify, async (req, res) => {
    try {
      const entry = await service.create(req.body)
      res.status(201).send(generalResponse.ok({ success: true, id: entry._id }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.put(`${path}/:id`, security.verify, async (req, res) => {
    try {
      const entry = await service.update(req.params.id, req.body, req.body.owner)
      res.send(generalResponse.ok({ success: true, id: entry._id }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })

  app.delete(`${path}/:id`, security.verify, async (req, res) => {
    try {
      const owner = req.body.owner || req.query.owner
      await service.remove(req.params.id, owner)
      res.send(generalResponse.ok({ success: true }))
    } catch (err) {
      res.status(err.statusCode || 500).send(generalResponse.error(err.message))
    }
  })
}
