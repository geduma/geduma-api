import express from 'express'
import path from 'node:path'
import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/service.js'

export function router (app) {
  app.use('/', express.static(path.resolve('../app/dist')))

  app.get('/all', (_, res) => {
    service.getAll()
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get('/owner/:owner', (req, res) => {
    service.getByOwner({ ownerStr: req.params.owner })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get('/schema/:owner/:schema', (req, res) => {
    service.getBySchema({
      ownerStr: req.params.owner,
      schemaStr: req.params.schema
    })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get('/name/:owner/:schema/:name', (req, res) => {
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

  app.use((_req, res, _next) => {
    res.status(404).send(generalResponse.error('Error, 404 Not Found'))
  })
}
