import archivesSchema from '../models/screenshot-backup/archives.model.js'
import { Endpoints } from '../constants/endpoints.js'

const getSummary = ({ schema }) => {
  return archivesSchema.find({
    schema
  })
}

const gedumaWebhook = ({ reqBody }) => {
  const obj = {}

  obj.schema = 'geduma'
  obj.userName = reqBody.channel_post.sender_chat.username || 'unknown'
  obj.backupDate = reqBody.channel_post.date || Date.now()
  obj.filePath = 'filePath_url.example'
  obj.textMessage = reqBody.channel_post.text || reqBody.channel_post.caption || ''
  obj.screenShotData = ''

  if (reqBody.channel_post.photo) {
    const imgObj = reqBody.channel_post.photo.reduce((a, b) => {
      return a.file_size > b.file_size ? a : b
    }, reqBody.channel_post.photo[0])

    console.log('Fetching telegram image with file_id:', imgObj)
    console.log(`${Endpoints.TELEGRAM_BOT_URL}${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${imgObj.file_id}`)

    fetch(`${Endpoints.TELEGRAM_BOT_URL}${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${imgObj.file_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Telegram file data:', data)
        obj.filePath = data.result.file_path
        console.log(`${Endpoints.TELEGRAM_BOT_URL}${process.env.TELEGRAM_BOT_TOKEN}/photos/${data.result.file_path}`)
        fetch(`${Endpoints.TELEGRAM_BOT_URL}${process.env.TELEGRAM_BOT_TOKEN}/photos/${data.result.file_path}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        })
          .then(res => res.buffer())
          .then(buffer => {
            obj.screenShotData = buffer.toString('base64')
            return saveArchive(obj)
          })
          .catch(err => console.error('Error converting buffer to base64:', err))
      })
      .catch(err => console.error('Error fetching telegram image:', err))
  } else return saveArchive(obj)
}

const saveArchive = ({ schema, userName, filePath, textMessage, screenShotData }) => {
  return archivesSchema.create({
    schema,
    userName,
    filePath,
    textMessage,
    screenShotData
  })
}

export const service = { getSummary, gedumaWebhook }
