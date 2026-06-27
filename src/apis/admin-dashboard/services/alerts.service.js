import { ALERT_THRESHOLDS } from '../config/alerts.config.js'
import { metricsService } from './metrics.service.js'
import { notify } from './notifier.service.js'

const activeAlerts = new Map()
const notifiedAlerts = new Map()
const NOTIFY_COOLDOWN_MS = 30 * 60 * 1000

const evaluate = async () => {
  const summary = await metricsService.getSummary()
  const now = Date.now()

  activeAlerts.clear()

  for (const mod of summary) {
    const total = mod.totalRequests
    if (total === 0) continue

    const { errorRate, slowResponse, notFoundRate } = ALERT_THRESHOLDS

    // Error rate
    if (errorRate && mod.errors > 0) {
      const pct = (mod.errors / total) * 100
      if (pct > errorRate.percent) {
        const { items: errors } = await metricsService.getRecentErrors({ limit: 5, module: mod.module })
        const paths = errors.filter(e => e.statusCode >= 500).map(e => `${e.method} ${e.path}`).join(', ')
        const id = `errorRate:${mod.module}`
        activeAlerts.set(id, {
          id,
          module: mod.module,
          type: 'errorRate',
          message: `${mod.module}: Error rate ${pct.toFixed(1)}% — ${paths.length > 0 ? paths : 'no details'}`,
          severity: errorRate.severity,
          timestamp: now
        })
      }
    }

    // Slow response
    if (slowResponse && mod.avgResponseTime > slowResponse.ms) {
      const errors = await metricsService.getRecentErrors(5, mod.module)
      const paths = errors.filter(e => e.responseTime > slowResponse.ms).map(e => `${e.method} ${e.path}`).join(', ')
      const id = `slowResponse:${mod.module}`
      activeAlerts.set(id, {
        id,
        module: mod.module,
        type: 'slowResponse',
        message: `${mod.module}: Avg response ${mod.avgResponseTime}ms — ${paths.length > 0 ? paths : 'no details'}`,
        severity: slowResponse.severity,
        timestamp: now
      })
    }

    // 404 rate
    if (notFoundRate && mod.clientErrors > 0) {
      const notFound = mod.clientErrors || 0
      const pct = total > 0 ? (notFound / total) * 100 : 0
      if (pct > notFoundRate.percent) {
        const { items: errors } = await metricsService.getRecentErrors({ limit: 5, module: mod.module })
        const paths = errors.map(e => `${e.method} ${e.path}`).join(', ')
        const id = `notFoundRate:${mod.module}`
        activeAlerts.set(id, {
          id,
          module: mod.module,
          type: 'notFoundRate',
          message: `${mod.module}: 4xx rate ${pct.toFixed(1)}% — ${paths.length > 0 ? paths : 'no details'}`,
          severity: notFoundRate.severity,
          timestamp: now
        })
      }
    }
  }

  // Auth failures
  if (ALERT_THRESHOLDS.authFailRate) {
    const { items: log } = await metricsService.getRecentErrors({ limit: 100 })
    const authFails = log.filter(l => l.statusCode === 401 || l.statusCode === 403)
    if (authFails.length > ALERT_THRESHOLDS.authFailRate.count) {
      const paths = authFails.slice(0, 5).map(e => `${e.method} ${e.path}`).join(', ')
      const id = 'authFailRate:global'
      activeAlerts.set(id, {
        id,
        module: 'auth',
        type: 'authFailRate',
        message: `Auth failures: ${authFails.length} — ${paths.length > 0 ? paths : 'no details'}`,
        severity: ALERT_THRESHOLDS.authFailRate.severity,
        timestamp: now
      })
    }
  }

  // Rate limit hits
  if (ALERT_THRESHOLDS.rateLimitHits) {
    const { items: rateLimited } = await metricsService.getRecentErrors({ limit: 100 })
    const rateHits = rateLimited.filter(l => l.statusCode === 429)
    if (rateHits.length > ALERT_THRESHOLDS.rateLimitHits.count) {
      const paths = rateHits.slice(0, 5).map(e => `${e.method} ${e.path}`).join(', ')
      const id = 'rateLimitHits:global'
      activeAlerts.set(id, {
        id,
        module: 'global',
        type: 'rateLimitHits',
        message: `Rate limited: ${rateHits.length} blocked — ${paths.length > 0 ? paths : 'no details'}`,
        severity: ALERT_THRESHOLDS.rateLimitHits.severity,
        timestamp: now
      })
    }
  }

  // Notify new ALERTs
  for (const [, alert] of activeAlerts) {
    if (alert.severity !== 'ALERT') continue
    const lastNotified = notifiedAlerts.get(alert.id)
    if (lastNotified && (now - lastNotified) < NOTIFY_COOLDOWN_MS) continue
    notifiedAlerts.set(alert.id, now)
    await notify({ title: `🚨 ${alert.module}`, message: alert.message, priority: 5 })
  }
}

const getActiveAlerts = () => {
  return Array.from(activeAlerts.values())
}

export const alertsService = { evaluate, getActiveAlerts }
