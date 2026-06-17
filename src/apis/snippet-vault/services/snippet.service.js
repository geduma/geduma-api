import { Endpoints } from '../../../constants/endpoints.js'
import snippetsSchema from '../models/snippets.model.js'

const authGitHub = async (code) => {
  const params = `?client_id=${process.env.SNIPPET_VAULT_GITHUB_CLIENT_ID}&client_secret=${process.env.SNIPPET_VAULT_GITHUB_CLIENT_SECRET}&code=${code}`
  const res = await fetch(Endpoints.GITHUB_ACCESS_TOKEN + params, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })
  const data = await res.json()
  if (data.access_token) {
    const user = await getUserGitHub(data.access_token)
    const { id, login, email, avatar_url: avatarUrl } = user
    return { id, login, email, avatarUrl }
  }
  throw new Error(data.error_description || 'GitHub auth failed')
}

const getUserGitHub = async (token) => {
  const res = await fetch(Endpoints.GITHUB_USER, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'token ' + token
    }
  })
  return res.json()
}

const getAll = () => {
  return snippetsSchema.find()
}

export const service = { authGitHub, getAll }
