import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import { router } from './src/main.router.js'
import { validateEnv } from './src/env-check.js'
import { jobs } from './src/jobs/index.js'

dotenv.config()
validateEnv()

const app = express()

app.set('port', (process.env.PORT != null) ? process.env.PORT : 3000)

// middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

// routes
router(app)

// jobs
jobs()

app.listen(app.get('port'), () => {
  console.log(`🚀 [port: ${app.get('port')}] server running...`)
})
