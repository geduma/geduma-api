import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { router } from './src/main.router.js'
import { validateEnv } from './src/env-check.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import { monitor } from './src/middleware/monitor.js'
import { jobs } from './src/jobs/index.js'

dotenv.config()
validateEnv()

const app = express()

app.set('port', (process.env.PORT != null) ? process.env.PORT : 3000)

// middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}))

// rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/admin'),
  message: { ok: false, msg: 'Too many requests, please try again later', data: [] }
})
app.use(generalLimiter)

app.use(monitor)

// routes
router(app)

// error handler
app.use(errorHandler)

// jobs
jobs()

app.listen(app.get('port'), () => {
  console.log(`🚀 [port: ${app.get('port')}] server running...`)
})
