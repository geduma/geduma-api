import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/snippet.service.js'
import { globalLimiter, readLimiter, writeLimiter } from '../../middleware/rateLimiter.js'

export function snippetVaultRouter (app) {
  const path = '/snippet-vault'
  app.use(path, globalLimiter)

  app.get(`${path}/`, readLimiter(60), (_, res) => {
    res.send(generalResponse.ok({ message: 'snippet-vault-api' }))
  })

  app.get(`${path}/all`, readLimiter(60), async (_, res) => {
    try {
      const data = await service.getAll()
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/group/:group`, readLimiter(60), async (req, res) => {
    try {
      const data = await service.getByGroup({ group: Number(req.params.group) })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/:id`, readLimiter(60), async (req, res) => {
    try {
      const data = await service.getById({ id: req.params.id })
      if (!data) return res.status(404).send(generalResponse.error('Snippet not found'))
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}`, writeLimiter(30), async (req, res) => {
    try {
      if (!req.body) throw new Error('Request body is required')
      const { group, title, description, tags, snippetValue, owner } = req.body
      if (!group || !title || !description || !snippetValue || !owner) throw new Error('group, title, description, snippetValue and owner are required')
      const data = await service.create({ group, title, description, tags, snippetValue, owner })
      res.status(201).send(generalResponse.ok(data))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })

  app.put(`${path}/:id`, writeLimiter(30), async (req, res) => {
    try {
      if (!req.body) throw new Error('Request body is required')
      const { group, title, description, tags, snippetValue, owner } = req.body
      const data = await service.update({ id: req.params.id, group, title, description, tags, snippetValue, owner })
      if (!data) return res.status(404).send(generalResponse.error('Snippet not found'))
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })

  app.delete(`${path}/:id`, writeLimiter(30), async (req, res) => {
    try {
      const data = await service.remove({ id: req.params.id })
      if (!data) return res.status(404).send(generalResponse.error('Snippet not found'))
      res.send(generalResponse.ok({ message: 'Snippet deleted' }))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })
}
