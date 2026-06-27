import { metricsService } from '../apis/admin-dashboard/services/metrics.service.js'

export function monitor (req, res, next) {
  if (req.path.startsWith('/admin')) return next()

  const start = Date.now()
  const module = req.path.split('/')[1] || 'root'

  res.on('finish', () => {
    const responseTime = Date.now() - start
    metricsService.log({
      module,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip
    })
  })

  next()
}
