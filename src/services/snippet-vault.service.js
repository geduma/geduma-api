import snippetsSchema from '../models/snippet-vault/snippets.model.js'

const auth = (code) => {
  const req = new Promise((resolve, reject) => {
    fetch('https://github.com/login/oauth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    })
      .then(res => res.json())
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err))
  })
  console.log(req)
  return req
}

const getAll = () => {
  return snippetsSchema.find()
}

export const service = { getAll, auth }
