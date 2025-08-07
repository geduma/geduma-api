import { generalResponse } from '../utils/generalResponse.js'
import { service } from '../services/snippet-vault.service.js'

export function snippetVaultRouter (app) {
  const path = '/snippet-vault'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'snippet-vault-api' }))
  })

  app.get(`${path}/all`, (_, res) => {
    service.getAll()
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.get(`${path}/auth`, (req, res) => {
    service.auth(req.query.code)
      .then(data => {
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })
}
