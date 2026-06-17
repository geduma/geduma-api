import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'
import { generateReport } from '../../utils/screenShotReport.js'
import { service as archiveService } from './services/archives.service.js'
import { service as telegramService } from './services/telegram.service.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'screenshot-backup-api' }))
  })

  app.get(`${path}/summary/:schema`, security.verify, async (req, res) => {
    try {
      const data = await archiveService.getSummary({ schema: req.params.schema })
      if (data.length <= 0) return res.status(204).end()
      res.send(generateReport(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/geduma/webhook`, async (req, res) => {
    try {
      const data = await telegramService.webhook({ reqBody: req.body })
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })
}
