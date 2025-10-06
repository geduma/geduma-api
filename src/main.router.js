import { generalResponse } from './utils/generalResponse.js'
import { authRouter } from './apis/geduma-auth/geduma-auth.routes.js'
import { configManagerRouter } from './apis/config-manager/config-manager.routes.js'
import { shortUrlRouter } from './apis/short-url/short-url.routes.js'
import { snippetVaultRouter } from './apis/snippet-vault/snippet-vault-routes.js'
import { screenshotBackupRouter } from './apis/screenshot-backup/screenshot-backup.routes.js'

export function router (app) {
  authRouter(app)
  configManagerRouter(app)
  snippetVaultRouter(app)
  shortUrlRouter(app)
  screenshotBackupRouter(app)

  app.get('/', (_, res) => {
    res.send(generalResponse.ok({ message: 'geduma-api' }))
  })

  app.use((_req, res, _next) => {
    res.status(404).send(generalResponse.error('Error, 404 Not Found'))
  })
}
