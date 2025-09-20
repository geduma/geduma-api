import { generalResponse } from '../utils/generalResponse.js'
import { configManagerRouter } from './config-manager-routes.js'
import { shortUrlRouter } from './short-url.routes.js'
import { snippetVaultRouter } from './snippet-vault-routes.js'

export function router (app) {
  configManagerRouter(app)
  snippetVaultRouter(app)
  shortUrlRouter(app)

  app.get('/', (_, res) => {
    res.send(generalResponse.ok({ message: 'geduramc-api' }))
  })

  app.use((_req, res, _next) => {
    res.status(404).send(generalResponse.error('Error, 404 Not Found'))
  })
}
