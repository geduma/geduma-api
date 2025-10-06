const envVars = [
  'API_SHORT_URL_KEY',
  'API_SHORT_URL_TOKEN_SECRET',
  'API_SNIPPET_VAULT_KEY',
  'API_SNIPPET_VAULT_TOKEN_SECRET',
  'API_SCREENSHOT_BACKUP_KEY',
  'API_SCREENSHOT_BACKUP_TOKEN_SECRET',
  'SNIPPET_VAULT_GITHUB_CLIENT_ID',
  'SNIPPET_VAULT_GITHUB_CLIENT_SECRET',
  'SHORT_URL_MONGODB_URI',
  'CONFIG_MANAGER_MONGODB_URI',
  'SNIPPET_VAULT_MONGODB_URI',
  'SCREENSHOT_BACKUP_MONGODB_URI',
  'TELEGRAM_SCREENSHOT_BACKUP_BOT_TOKEN'
]

export function validateEnv (requiredKeys = envVars) {
  const missing = requiredKeys.filter(k => !process.env[k])

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present.')
}
