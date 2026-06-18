import { googleHandler } from './google.js'
import { githubHandler } from './github.js'
import { microsoftHandler } from './microsoft.js'

const handlers = {
  google: googleHandler,
  github: githubHandler,
  microsoft: microsoftHandler
}

export const getOAuthHandler = (provider) => {
  const handler = handlers[provider]
  if (!handler) throw new Error(`Unsupported OAuth provider: ${provider}`)
  return handler
}
