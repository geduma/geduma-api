import jwt from 'jsonwebtoken'

const auth = ({ name, user, key }, { apiKey, apiSecret }) => {
  return new Promise((resolve, reject) => {
    if (key !== apiKey) reject(new Error('invalid or missing api key'))
    resolve({
      token: jwt.sign({
        name,
        user
      }, apiSecret, null)
    })
  })
}

const verify = ({ token, apiSecret }) => {
  let res = true
  try {
    if (!token) res = false
    jwt.verify(token.split(' ')[1], apiSecret)
  } catch (error) {
    res = false
  }

  return res
}

export const service = { auth, verify }
