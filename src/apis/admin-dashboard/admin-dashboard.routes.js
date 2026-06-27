import fs from 'fs'
import path from 'path'
import { generalResponse } from '../../utils/generalResponse.js'
import { metricsService } from './services/metrics.service.js'
import { alertsService } from './services/alerts.service.js'
import { allowedService } from '../geduma-auth/services/allowed-users.service.js'
import { globalLimiter, readLimiter } from '../../middleware/rateLimiter.js'

const getHtml = () => {
  const htmlPath = path.resolve('src/apis/admin-dashboard/static/index.html')
  return fs.readFileSync(htmlPath, 'utf-8')
}

const adminGuard = (req, res, next) => {
  const email = req.headers['x-admin-email'] || req.query.email
  if (!email) {
    return res.status(401).send(generalResponse.error('x-admin-email header or ?email= required'))
  }
  allowedService.find(email, '0').then(user => {
    if (!user) {
      return res.status(403).send(generalResponse.error('Not authorized'))
    }
    req.adminUser = { email, user }
    next()
  }).catch(() => {
    res.status(500).send(generalResponse.error('Authorization check failed'))
  })
}

export function adminRouter (app) {
  const p = '/admin'

  app.use(p, globalLimiter)

  app.get(p, adminGuard, async (req, res) => {
    try {
      let html = getHtml()
      html = html.replace('{{ADMIN_EMAIL}}', req.adminUser.email)
      res.send(html)
    } catch (error) {
      res.status(500).send(generalResponse.error(error.message))
    }
  })

  app.get(`${p}/api/summary`, readLimiter(30), adminGuard, async (req, res) => {
    try {
      const summary = await metricsService.getSummary()
      res.send(generalResponse.ok(summary))
    } catch (error) {
      res.status(500).send(generalResponse.error(error.message))
    }
  })

  app.get(`${p}/api/modules/:module`, readLimiter(30), adminGuard, async (req, res) => {
    try {
      const detail = await metricsService.getModuleDetail(req.params.module)
      res.send(generalResponse.ok(detail))
    } catch (error) {
      res.status(500).send(generalResponse.error(error.message))
    }
  })

  app.get(`${p}/api/errors`, readLimiter(30), adminGuard, async (req, res) => {
    try {
      const errors = await metricsService.getRecentErrors({ limit: Number(req.query.limit) || 10, page: Number(req.query.page) || 1, code: req.query.code, tab: req.query.tab || 'errors' })
      res.send(generalResponse.ok(errors))
    } catch (error) {
      res.status(500).send(generalResponse.error(error.message))
    }
  })

  app.get(`${p}/api/doomy`, readLimiter(10), adminGuard, async (req, res) => {
    metricsService.log({
      module: 'admin',
      method: 'GET',
      path: '/admin/api/doomy',
      statusCode: 500,
      responseTime: 0,
      ip: req.ip
    })
    res.status(500).send(generalResponse.error('🔥 Doomy forced 500 — test alert'))
  })

  app.get(`${p}/api/alerts`, readLimiter(30), adminGuard, async (req, res) => {
    try {
      await alertsService.evaluate()
      const alerts = alertsService.getActiveAlerts()
      res.send(generalResponse.ok(alerts))
    } catch (error) {
      res.status(500).send(generalResponse.error(error.message))
    }
  })
}
