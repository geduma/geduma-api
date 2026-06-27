export const ALERT_THRESHOLDS = {
  errorRate: { percent: 10, windowMinutes: 5, severity: 'ALERT' },
  requestSpike: { multiplier: 3, windowMinutes: 1, severity: 'WARN' },
  slowResponse: { ms: 2000, windowMinutes: 5, severity: 'ALERT' },
  authFailRate: { count: 10, windowMinutes: 1, severity: 'ALERT' },
  rateLimitHits: { count: 50, windowMinutes: 1, severity: 'WARN' },
  notFoundRate: { percent: 50, windowMinutes: 5, severity: 'WARN' },
  singleIpFlood: { count: 30, windowMinutes: 1, severity: 'ALERT' }
}
