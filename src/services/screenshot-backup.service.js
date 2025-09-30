import archivesSchema from '../models/screenshot-backup/archives.model.js'
import { Endpoints } from '../constants/endpoints.js'
import { imageUrlToBase64 } from '../utils/imageUrlToBase64.js'

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

    fetch(`${Endpoints.TELEGRAM_GET_FILE}?file_id=${imgObj.file_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        obj.filePath = data.result.file_path
        console.log(`${Endpoints.TELEGRAM_FILE_BASE_URL}/${data.result.file_path}`)
        imageUrlToBase64(`${Endpoints.TELEGRAM_FILE_BASE_URL}/${data.result.file_path}`)
          .then(base64 => {
            obj.screenShotData = base64
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
