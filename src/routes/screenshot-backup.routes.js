import { service } from '../services/screenshot-backup.service.js'
import { generalResponse } from '../utils/generalResponse.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send({ message: 'screenshot-backup-api' })
  })

  app.post(`${path}/geduma/webhook`, (req, res) => {
    res.send(generalResponse.ok(service.gedumaWebhook({ reqBody: req.body })))
  })
}
