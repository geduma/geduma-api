import { service } from '../services/screenshot-backup.service.js'
import { generalResponse } from '../utils/generalResponse.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send({ message: 'screenshot-backup-api' })
  })

  app.post(`${path}/webhook`, (req, res) => {
    res.send(generalResponse.ok(service.webhook({ reqBody: req.body })))
  })
}
