export const Endpoints = {
  GITHUB_ACCESS_TOKEN: 'https://github.com/login/oauth/access_token',
  GITHUB_USER: 'https://api.github.com/user',
  TELEGRAM_GET_FILE: `https://api.telegram.org/bot${process.env.TELEGRAM_SCREENSHOT_BACKUP_BOT_TOKEN}/getFile`,
  TELEGRAM_FILE_BASE_URL: `https://api.telegram.org/file/bot${process.env.TELEGRAM_SCREENSHOT_BACKUP_BOT_TOKEN}`,
  TELEGRAM_DELETE_MESSAGE: `https://api.telegram.org/bot${process.env.TELEGRAM_SCREENSHOT_BACKUP_BOT_TOKEN}/deleteMessage`
}
