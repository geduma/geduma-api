import { Endpoints } from '../../../constants/endpoints.js'
import snippetsSchema from '../models/snippets.model.js'

const authGitHub = (code) => {
  return new Promise((resolve, reject) => {
    const params = '?client_id=' + process.env.SNIPPET_VAULT_GITHUB_CLIENT_ID + '&client_secret=' + process.env.SNIPPET_VAULT_GITHUB_CLIENT_SECRET + '&code=' + code
    fetch(Endpoints.GITHUB_ACCESS_TOKEN + params, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          getUserGitHub(data.access_token)
            .then(user => {
              const { id, login, email, avatar_url: avatarUrl } = user
              resolve({ id, login, email, avatarUrl })
            })
        } else reject(data)
      })
      .catch(err => reject(err))
  })
}

const getUserGitHub = (token) => {
  return new Promise((resolve, reject) => {
    fetch(Endpoints.GITHUB_USER, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'token ' + token
      }
    })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}

const getAll = () => {
  return snippetsSchema.find()
}

export const service = { authGitHub, getAll }
