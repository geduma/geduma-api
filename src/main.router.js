import { generalResponse } from './utils/generalResponse.js'
import { authRouter } from './apis/geduma-auth/geduma-auth.routes.js'
import { configManagerRouter } from './apis/config-manager/config-manager.routes.js'
import { shortUrlRouter } from './apis/short-url/short-url.routes.js'
import { snippetVaultRouter } from './apis/snippet-vault/snippet-vault-routes.js'
import { screenshotBackupRouter } from './apis/screenshot-backup/screenshot-backup.routes.js'
import { gnotesRouter } from './apis/gnotes/gnotes.routes.js'
import { gpassRouter } from './apis/gpass/gpass.routes.js'
import { adminRouter } from './apis/admin-dashboard/admin-dashboard.routes.js'
import { iconService } from './apis/admin-dashboard/services/icon.service.js'

export function router (app) {
  authRouter(app)
  configManagerRouter(app)
  snippetVaultRouter(app)
  shortUrlRouter(app)
  screenshotBackupRouter(app)
  gnotesRouter(app)
  gpassRouter(app)
  adminRouter(app)

  app.get('/', (_, res) => {
    res.send(generalResponse.ok({ message: 'geduma-api' }))
  })

  app.get('/favicon.ico', async (_req, res, next) => {
    try {
      const { buf, contentType } = await iconService.favicon()
      res.set('Content-Type', contentType)
      res.set('Cache-Control', 'public, max-age=86400')
      res.end(buf)
    } catch (e) { next(e) }
  })

  app.get('/apple-touch-icon*.png', async (_req, res, next) => {
    try {
      const { buf, contentType } = await iconService.appleTouch(120)
      res.set('Content-Type', contentType)
      res.set('Cache-Control', 'public, max-age=86400')
      res.end(buf)
    } catch (e) { next(e) }
  })

  app.use((_req, res, _next) => {
    res.status(404).send(generalResponse.error('Error, 404 Not Found'))
  })
}
