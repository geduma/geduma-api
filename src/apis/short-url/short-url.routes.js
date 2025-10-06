import { generalResponse } from '../../utils/generalResponse.js'
import { service } from '../short-url/services/custom-url.service.js'
import { security } from '../../interceptors/security.interceptor.js'

export function shortUrlRouter (app) {
  const path = '/short-url'

  app.get(`${path}/`, (_, res) => {
    res.send(generalResponse.ok({ message: 'short-url-api' }))
  })

  app.get(`${path}/:id`, (req, res) => {
    service.getByShort({ id: req.params.id })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/short`, security.verify, (req, res) => {
    const shortUrl = Math.random()
      .toString(36)
      .substr(2, 6)

    service.saveUrl({ originUrl: req.body.url, shortUrl })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })

  app.post(`${path}/short-by-project`, security.verify, (req, res) => {
    const shortUrl = Math.random()
      .toString(36)
      .substr(2, 6)

    service.saveUrlByProject({ originUrl: req.body.url, shortUrl, project: req.body.project })
      .then(data => {
        if (data.length <= 0) res.status(204)
        res.send(generalResponse.ok(data))
      }).catch((err) => res.send(generalResponse.error(err)))
  })
}
