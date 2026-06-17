import { generalResponse } from '../../utils/generalResponse.js'
import { service } from './services/snippet.service.js'

export function snippetVaultRouter (app) {
  const path = '/snippet-vault'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'snippet-vault-api' }))
  })

  app.get(`${path}/all`, async (_, res) => {
    try {
      const data = await service.getAll()
      if (data.length <= 0) return res.status(204).end()
      res.send(generalResponse.ok(data))
    } catch (err) {
      res.send(generalResponse.error(err.message))
    }
  })
}
