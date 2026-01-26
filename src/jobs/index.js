import * as cron from 'node-cron'
import { security } from './src/interceptors/security.interceptor.js'

export function jobs () {
  cron.schedule('0 0 * * *', () => {
    security.cleanOldTokens()
  })
}
