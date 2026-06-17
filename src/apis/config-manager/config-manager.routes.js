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
}
