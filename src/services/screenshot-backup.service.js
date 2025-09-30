import archivesSchema from '../models/screenshot-backup/archives.model.js'
import { Endpoints } from '../constants/endpoints.js'
import { imageUrlToBase64 } from '../utils/imageUrlToBase64.js'

const getSummary = ({ schema }) => {
  return archivesSchema.find({ schema })
    .select('-screenShotData')
}

const getSummaryAll = ({ schema }) => {
  return archivesSchema.find({ schema })
}

const gedumaWebhook = ({ reqBody }) => {
  return new Promise((resolve, reject) => {
    const obj = {}

    obj.schema = 'geduma'
    obj.userName = reqBody.message.from.username || 'unknown'
    obj.backupDate = reqBody.message.date || Date.now()
    obj.textMessage = reqBody.message.text || reqBody.message.caption || ''

    if (reqBody.message.photo.length > 0) {
      const imgObj = reqBody.message.photo.reduce((a, b) => {
        return a.file_size > b.file_size ? a : b
      }, reqBody.message.photo[0])

      console.log(reqBody.message.photo[0])
      console.log(`${Endpoints.TELEGRAM_GET_FILE}?file_id=${imgObj.file_id}`)

      fetch(`${Endpoints.TELEGRAM_GET_FILE}?file_id=${imgObj.file_id}`)
        .then(res => res.json())
        .then(data => {
          console.log(data)
          obj.filePath = data.result.file_path
          if (obj.file_path !== undefined) Error('Empy file_path')
          imageUrlToBase64(`${Endpoints.TELEGRAM_FILE_BASE_URL}/${obj.file_path}`)
            .then(base64 => {
              obj.screenShotData = base64
              resolve(saveArchive(obj))
            })
            .catch(err => {
              console.error('Error converting buffer to base64:', err)
              reject(err)
            })
        })
        .catch(err => {
          console.error('Error fetching telegram image:', err)
          reject(err)
        })
    } else resolve({})

    fetch(`${Endpoints.TELEGRAM_DELETE_MESSAGE}?chat_id=${reqBody.message.chat.id}&message_id=${reqBody.message.message_id}`)
  })
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

export const service = { getSummary, getSummaryAll, gedumaWebhook }
