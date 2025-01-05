import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/config-manager/service.js'

export function configManagerRouter (app) {
  const path = '/config-manager'

  app.get(`${path}/all`, (_, res) => {
    service.getAll()
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get(`${path}/owner/:owner`, (req, res) => {
    service.getByOwner({ ownerStr: req.params.owner })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get(`${path}/schema/:owner/:schema`, (req, res) => {
    service.getBySchema({
      ownerStr: req.params.owner,
      schemaStr: req.params.schema
    })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get(`${path}/name/:owner/:schema/:name`, (req, res) => {
    service.getByName({
      ownerStr: req.params.owner,
      schemaStr: req.params.schema,
      nameStr: req.params.name
    })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })
}
