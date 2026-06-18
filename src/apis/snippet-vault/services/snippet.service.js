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

const getById = ({ id }) => {
  return snippetsSchema.findById(id)
}

const getByGroup = ({ group }) => {
  return snippetsSchema.find({ group })
}

const create = ({ group, title, description, tags, snippetValue, owner }) => {
  return snippetsSchema.create({ group, title, description, tags, snippetValue, owner })
}

const update = ({ id, group, title, description, tags, snippetValue, owner }) => {
  const updateFields = {}
  if (group !== undefined) updateFields.group = group
  if (title !== undefined) updateFields.title = title
  if (description !== undefined) updateFields.description = description
  if (tags !== undefined) updateFields.tags = tags
  if (snippetValue !== undefined) updateFields.snippetValue = snippetValue
  if (owner !== undefined) updateFields.owner = owner
  return snippetsSchema.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true })
}

const remove = ({ id }) => {
  return snippetsSchema.findByIdAndDelete(id)
}

export const service = { authGitHub, getAll, getById, getByGroup, create, update, remove }
