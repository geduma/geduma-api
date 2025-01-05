import { generalResponse } from '../utils/generalResponse.js'

export function snippetVaultRouter (app) {
  const path = '/snippet-vault'

  app.get(`${path}/all`, (_, res) => {
    res.send(generalResponse.ok('Hello World Snippet Vault'))
  })
}
