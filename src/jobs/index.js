import * as cron from 'node-cron'
import { security } from '..//interceptors/security.interceptor.js'

export function jobs () {
  cron.schedule('0 0 * * *', () => {
    security.cleanOldTokens()
  })
}
