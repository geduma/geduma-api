import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, msg: 'Too many requests, please try again later', data: [] }
})

export function readLimiter (max = 60) {
  return rateLimit({
    windowMs: 60 * 1000,
    max,
    keyGenerator: (req) => `${ipKeyGenerator(req)}_${req.query?.owner || 'unknown'}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, msg: 'Too many read requests', data: [] }
  })
}

export function writeLimiter (max = 30) {
  return rateLimit({
    windowMs: 60 * 1000,
    max,
    keyGenerator: (req) => `${ipKeyGenerator(req)}_${req.body?.owner || req.query?.owner || 'unknown'}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, msg: 'Too many write requests', data: [] }
  })
}
