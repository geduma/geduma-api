import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import { router } from './routes/router.js'
import mongoose from 'mongoose'

dotenv.config()
const app = express()

app.set('port', (process.env.PORT != null) ? process.env.PORT : 3000)

// middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

// routes
router(app)

// mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ mongo_db conected!'))
  .catch(err => console.error(`❌ ${err}`))

app.listen(app.get('port'), () => {
  console.log(`🚀 [port: ${app.get('port')}] server running...`)
})
