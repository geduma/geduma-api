import { service } from '../services/screenshot-backup.service.js'
import { generalResponse } from '../utils/generalResponse.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send({ message: 'screenshot-backup-api' })
  })

  app.get(`${path}/summary/:schema`, (req, res) => {
    service.getSummary({ schema: req.params.schema })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/geduma/webhook`, (req, res) => {
    service.gedumaWebhook({ reqBody: req.body })
      .then(data => res.send(generalResponse.ok(data)))
      .catch((err) => res.send(generalResponse.error(err)))
  })
}
