import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/configurations.service.js'

export function configManagerRouter (app) {
  const path = '/config-manager'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'config-manager-api' }))
  })

  app.get(`${path}/all`, async (_, res) => {
    try {
      const data = await service.getAll()
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/owner/:owner`, async (req, res) => {
    try {
      const data = await service.getByOwner({ ownerStr: req.params.owner })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/schema/:owner/:schema`, async (req, res) => {
    try {
      const data = await service.getBySchema({
        ownerStr: req.params.owner,
        schemaStr: req.params.schema
      })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.get(`${path}/name/:owner/:schema/:name`, async (req, res) => {
    try {
      const data = await service.getByName({
        ownerStr: req.params.owner,
        schemaStr: req.params.schema,
        nameStr: req.params.name
      })
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}`, async (req, res) => {
    try {
      if (!req.body) throw new Error('Request body is required')
      const { owner, schema, name, value, expiration } = req.body
      if (!owner || !schema || !name) throw new Error('owner, schema and name are required')
      const data = await service.create({ owner, schema, name, value, expiration })
      res.status(201).send(generalResponse.ok(data))
    } catch (err) {
      if (err.code === 11000) return res.status(409).send(generalResponse.error('Configuration already exists'))
      res.status(400).send(generalResponse.error(err.message))
    }
  })

  app.put(`${path}/name/:owner/:schema/:name`, async (req, res) => {
    try {
      if (!req.body) throw new Error('Request body is required')
      const { value, expiration } = req.body
      const data = await service.update({
        ownerStr: req.params.owner,
        schemaStr: req.params.schema,
        nameStr: req.params.name,
        value,
        expiration
      })
      if (!data) return res.status(404).send(generalResponse.error('Configuration not found'))
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })

  app.delete(`${path}/name/:owner/:schema/:name`, async (req, res) => {
    try {
      const data = await service.remove({
        ownerStr: req.params.owner,
        schemaStr: req.params.schema,
        nameStr: req.params.name
      })
      if (!data) return res.status(404).send(generalResponse.error('Configuration not found'))
      res.send(generalResponse.ok({ message: 'Configuration deleted' }))
    } catch (err) {
      res.status(400).send(generalResponse.error(err.message))
    }
  })
}
