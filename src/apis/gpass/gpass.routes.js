import cors from 'cors'
import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/gpass.service.js'
import { security } from '../../interceptors/security.interceptor.js'
import { globalLimiter, readLimiter, writeLimiter } from '../../middleware/rateLimiter.js'
import { validate } from '../../middleware/validate.js'
import { createSchema, updateSchema } from './gpass.validation.js'

export function gpassRouter (app) {
  const path = '/gpass'

  app.use(path, cors({ origin: 'https://pass.geduma.com' }))
  app.use(path, globalLimiter)

  app.get(path, readLimiter(60), security.verify, async (req, res) => {
    try {
      const owner = req.query.owner
      const q = req.query.q
      const data = await service.getAll(owner, q)
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      const status = err.statusCode || 500
      const message = status === 500 ? 'Internal server error' : err.message
      res.status(status).send(generalResponse.error(message))
    }
  })
  app.get(`${path}/:id`, readLimiter(60), security.verify, async (req, res) => {
    try {
      const owner = req.query.owner
      const data = await service.getById(req.params.id, owner)
      if (!data) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      const status = err.statusCode || 500
      const message = status === 500 ? 'Internal server error' : err.message
      res.status(status).send(generalResponse.error(message))
    }
  })

  app.post(path, writeLimiter(30), security.verify, validate(createSchema), async (req, res) => {
    try {
      const entry = await service.create(req.body)
      res.status(201).send(generalResponse.ok({ success: true, id: entry._id }))
    } catch (err) {
      const status = err.statusCode || 500
      const message = status === 500 ? 'Internal server error' : err.message
      res.status(status).send(generalResponse.error(message))
    }
  })

  app.put(`${path}/:id`, writeLimiter(30), security.verify, validate(updateSchema), async (req, res) => {
    try {
      const entry = await service.update(req.params.id, req.body, req.body.owner)
      res.send(generalResponse.ok({ success: true, id: entry._id }))
    } catch (err) {
      const status = err.statusCode || 500
      const message = status === 500 ? 'Internal server error' : err.message
      res.status(status).send(generalResponse.error(message))
    }
  })

  app.delete(`${path}/:id`, writeLimiter(30), security.verify, async (req, res) => {
    try {
      const owner = req.body.owner || req.query.owner
      await service.remove(req.params.id, owner)
      res.send(generalResponse.ok({ success: true }))
    } catch (err) {
      const status = err.statusCode || 500
      const message = status === 500 ? 'Internal server error' : err.message
      res.status(status).send(generalResponse.error(message))
    }
  })
}
