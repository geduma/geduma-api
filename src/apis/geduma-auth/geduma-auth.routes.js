import { generalResponse } from '../utils/generalResponse.js'

export function shortUrlRouter (app) {
  const path = '/auth'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'geduma-auth-api' }))
  })
}
