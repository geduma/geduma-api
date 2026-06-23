import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'
import { generateReport } from '../../utils/screenShotReport.js'
import { service as archiveService } from './services/archives.service.js'
import { service as telegramService } from './services/telegram.service.js'
import { globalLimiter, readLimiter, writeLimiter } from '../../middleware/rateLimiter.js'

export function screenshotBackupRouter (app) {
  const path = '/screenshot-backup'
  app.use(path, globalLimiter)

  app.get(`${path}/`, readLimiter(30), (_, res) => {
    res.send(generalResponse.ok({ message: 'screenshot-backup-api' }))
  })

  app.get(`${path}/summary/:schema`, readLimiter(30), security.verify, async (req, res) => {
    try {
      const data = await archiveService.getSummary({ schema: req.params.schema })
      if (data.length <= 0) return res.status(204).end()
      res.send(generateReport(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })

  app.post(`${path}/geduma/webhook`, writeLimiter(20), async (req, res) => {
    try {
      const data = await telegramService.webhook({ reqBody: req.body })
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })
}
