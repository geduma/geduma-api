import fs from 'fs'
import path from 'path'
import { generalResponse } from '../../utils/generalResponse.js'
import { security } from '../../interceptors/security.interceptor.js'
import { service } from './services/auth.service.js'

export function authRouter (app) {
  const p = '/auth'

  const getHtml = () => {
    const htmlPath = path.resolve('static/index.html')
    return fs.readFileSync(htmlPath, 'utf-8')
  }

  app.get(`${p}`, async (req, res) => {
    try {
      const { code, state } = req.query

      if (code && state) {
        const result = await service.handleCallback({ code, state })
        let html = getHtml()
        html = html.replace('{{REDIRECT_URL}}', result.redirectUrl)
        html = html.replace('{{SESSION_TOKEN}}', result.sessionToken)
        html = html.replace('{{ERROR}}', '')
        res.send(html)
      } else {
        let html = getHtml()
        html = html.replace('{{REDIRECT_URL}}', '')
        html = html.replace('{{SESSION_TOKEN}}', '')
        html = html.replace('{{ERROR}}', '')
        res.send(html)
      }
    } catch (error) {
      let html = getHtml()
      html = html.replace('{{REDIRECT_URL}}', '')
      html = html.replace('{{SESSION_TOKEN}}', '')
      html = html.replace('{{ERROR}}', error.message)
      res.send(html)
    }
  })

  app.get(`${p}/providers/:appId`, async (req, res) => {
    try {
      const { appId } = req.params
      const providers = await service.getProvidersForApp(appId)
      if (providers.length === 0) {
        return res.status(204).send()
      }
      res.send(generalResponse.ok(providers))
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })

  app.post(`${p}/login/:appId/:provider`, async (req, res) => {
    try {
      const { appId, provider } = req.params
      const { redirect_url: redirectUrl } = req.body
      if (!redirectUrl) throw new Error('redirect_url is required')
      const result = await service.initiateLogin({ appId, provider, redirectUrl })
      res.send(generalResponse.ok(result))
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })

  app.get(`${p}/session/:sessionToken`, async (req, res) => {
    try {
      const { sessionToken } = req.params
      const data = await service.getSession(sessionToken)
      res.send(generalResponse.ok(data))
    } catch (error) {
      res.status(404).send(generalResponse.error(error.message))
    }
  })

  app.post(`${p}`, async (req, res) => {
    try {
      if (!req.body) throw new Error('Request body is required')
      const { name, user, key, data } = req.body
      if (!name || !key) throw new Error('name and key are required')
      const result = await security.auth({ name, user, key, data })
      res.send(generalResponse.ok(result))
    } catch (error) {
      res.status(400).send(generalResponse.error(error.message))
    }
  })

  // POST /auth/set-provider removed — providers are configured in DB
}
