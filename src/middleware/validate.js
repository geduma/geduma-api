import { generalResponse } from '../utils/generalResponse.js'

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).send(generalResponse.error(error.details[0].message))
    }
    next()
  }
}
