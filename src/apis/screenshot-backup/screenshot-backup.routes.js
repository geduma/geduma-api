import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'
import { generateReport } from '../../utils/screenShotReport.js'
import { service as archiveService } from './services/archives.service.js'
import { service as telegramService } from './services/telegram.service.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send({ message: 'screenshot-backup-api' })
  })

  app.get(`${path}/summary/:schema`, security.verify, (req, res) => {
    archiveService.getSummary({ schema: req.params.schema })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generateReport(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/geduma/webhook`, (req, res) => {
    telegramService.webhook({ reqBody: req.body })
      .then(data => res.send(generalResponse.ok(data)))
      .catch((err) => res.send(generalResponse.error(err)))
  })
}
