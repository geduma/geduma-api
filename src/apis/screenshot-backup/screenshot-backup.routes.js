import { service } from './services/archives.service.js'
import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'
import { generateReport } from '../../utils/screenShotReport.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send({ message: 'screenshot-backup-api' })
  })

  app.get(`${path}/summary/:schema`, security.verify, (req, res) => {
    service.getSummary({ schema: req.params.schema })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generateReport(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/auth`, async (req, res) => {
    try {
      const { name, user, key } = req.body
      const data = await security.auth({ name, user, key }, { apiKey: process.env.API_SCREENSHOT_BACKUP_KEY, apiSecret: process.env.API_SCREENSHOT_BACKUP_TOKEN_SECRET })
      res.send(generalResponse.ok(data))
    } catch (error) {
      res.status(400).send(generalResponse.error(error))
    }
  })

  app.post(`${path}/geduma/webhook`, (req, res) => {
    service.telegramWebhook({ reqBody: req.body })
      .then(data => res.send(generalResponse.ok(data)))
      .catch((err) => res.send(generalResponse.error(err)))
  })
}
