import RequestLog from '../models/request-log.model.js'

const log = async ({ module, method, path, statusCode, responseTime, ip }) => {
  try {
    await RequestLog.create({ module, method, path, statusCode, responseTime, ip })
  } catch {
    // fire-and-forget, never block the request
  }
}

const getSummary = async () => {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

  const stats = await RequestLog.aggregate([
    { $match: { timestamp: { $gte: fiveMinAgo } } },
    {
      $group: {
        _id: '$module',
        totalRequests: { $sum: 1 },
        errorCount: { $sum: { $cond: [{ $gte: ['$statusCode', 500] }, 1, 0] } },
        clientErrorCount: { $sum: { $cond: [{ $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] }, 1, 0] } },
        slowCount: { $sum: { $cond: [{ $gte: ['$responseTime', 2000] }, 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    { $sort: { totalRequests: -1 } }
  ])

  return stats.map(s => ({
    module: s._id,
    totalRequests: s.totalRequests,
    errors: s.errorCount,
    clientErrors: s.clientErrorCount,
    slowCount: s.slowCount,
    avgResponseTime: Math.round(s.avgResponseTime || 0)
  }))
}

const getModuleDetail = async (module) => {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

  const [stats] = await RequestLog.aggregate([
    { $match: { module, timestamp: { $gte: fiveMinAgo } } },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        errorCount: { $sum: { $cond: [{ $gte: ['$statusCode', 500] }, 1, 0] } },
        clientErrorCount: { $sum: { $cond: [{ $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] }, 1, 0] } },
        slowCount: { $sum: { $cond: [{ $gte: ['$responseTime', 2000] }, 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' },
        statusCodes: { $push: '$statusCode' }
      }
    }
  ])

  const errors = await RequestLog.find(
    { module, statusCode: { $gte: 400 } },
    { method: 1, path: 1, statusCode: 1, responseTime: 1, ip: 1, timestamp: 1, _id: 0 }
  ).sort({ timestamp: -1 }).limit(20)

  if (!stats) return { module, totalRequests: 0, errors: [], recentErrors: [] }

  const codeCounts = {}
  for (const code of stats.statusCodes) {
    codeCounts[code] = (codeCounts[code] || 0) + 1
  }

  return {
    module,
    totalRequests: stats.totalRequests,
    errors: stats.errorCount,
    clientErrors: stats.clientErrorCount,
    slowCount: stats.slowCount,
    avgResponseTime: Math.round(stats.avgResponseTime || 0),
    statusCodeDistribution: codeCounts,
    recentErrors: errors
  }
}

const getRecentErrors = async ({ limit = 10, page = 1, module, code, tab = 'errors' } = {}) => {
  const filter = {}
  if (tab === 'errors') filter.statusCode = { $gte: 400 }
  if (module) filter.module = module
  if (code) {
    if (code === '4xx') filter.statusCode = { $gte: 400, $lt: 500 }
    else if (code === '5xx') filter.statusCode = { $gte: 500, $lt: 600 }
    else filter.statusCode = Number(code)
  }
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    RequestLog.find(
      filter,
      { method: 1, path: 1, statusCode: 1, responseTime: 1, ip: 1, module: 1, timestamp: 1, _id: 0 }
    ).sort({ timestamp: -1 }).skip(skip).limit(limit),
    RequestLog.countDocuments(filter)
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export const metricsService = { log, getSummary, getModuleDetail, getRecentErrors }
