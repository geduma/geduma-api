import { metricsService } from '../apis/admin-dashboard/services/metrics.service.js'

const KNOWN_MODULES = ['auth', 'config-manager', 'short-url', 'snippet-vault', 'screenshot-backup', 'gnotes', 'gpass']

export function monitor (req, res, next) {
  if (req.path.startsWith('/admin')) return next()

  const start = Date.now()
  const firstSegment = req.path.split('/')[1] || 'root'
  const module = KNOWN_MODULES.includes(firstSegment) ? firstSegment : 'root'

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
