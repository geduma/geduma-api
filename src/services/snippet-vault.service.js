import snippetsSchema from '../models/snippet-vault/snippets.model.js'

const auth = (code) => {
  return new Promise((resolve, reject) => {
    const params = '?client_id=' + process.env.SNIPPET_VAULT_GITHUB_CLIENT_ID + '&client_secret=' + process.env.SNIPPET_VAULT_GITHUB_CLIENT_SECRET + '&code=' + code
    fetch('https://github.com/login/oauth/access_token' + params, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          console.log('access_token :::: ', data.access_token)
          getUser(data.access_token)
            .then(user => {
              const { id, login, name, email } = user
              resolve({ id, login, name, email })
            })
        } else reject(data)
      })
      .catch(err => {
        console.log('err :::: ', err)
        reject(err)
      })
  })
}

const getUser = (token) => {
  return new Promise((resolve, reject) => {
    fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'token ' + token
      }
    })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => {
        console.log('err2 :::: ', err)
        reject(err)
      })
  })
}

const getAll = () => {
  return snippetsSchema.find()
}

export const service = { getAll, auth }
