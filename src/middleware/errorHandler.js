import { generalResponse } from '../utils/generalResponse.js'

export const errorHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  res.status(statusCode).send(generalResponse.error(message))
}
