const webhook = ({ reqBody }) => {
  console.log('screenshot-backup.service.js - webhook', reqBody)
  return `webhook service ${JSON.stringify(reqBody)}`
}

export const service = { webhook }
