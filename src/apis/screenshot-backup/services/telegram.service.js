import { Endpoints } from '../../../constants/endpoints.js'
import { imageUrlToBase64 } from '../../../utils/imageUrlToBase64.js'
import { service as archiveService } from './archives.service.js'

const webhook = ({ reqBody, schema }) => {
  return new Promise((resolve, reject) => {
    const obj = {}

    obj.schema = schema || 'geduma'
    obj.userName = reqBody.message.from.username || 'unknown'
    obj.backupDate = new Date().getTime()
    obj.textMessage = reqBody.message.text || reqBody.message.caption || ''

    if (obj.textMessage.includes('delete')) {
      archiveService.deleteArchive({ id: obj.textMessage.split('delete ')[1] })
      sendMessage({ chatId: reqBody.message.chat.id, text: `Requested deletion of archive ID: ${obj.textMessage.split('delete ')[1]}` })
      resolve({ message: 'Delete request processed' })
    }

    if (reqBody.message.photo.length > 0) {
      const imgObj = reqBody.message.photo.reduce((a, b) => {
        return a.file_size > b.file_size ? a : b
      }, reqBody.message.photo[0])

      fetch(`${Endpoints.TELEGRAM_GET_FILE}?file_id=${imgObj.file_id}`)
        .then(res => res.json())
        .then(data => {
          obj.filePath = data.result.file_path
          imageUrlToBase64(`${Endpoints.TELEGRAM_FILE_BASE_URL}/${obj.filePath}`)
            .then(base64 => {
              obj.screenShotData = base64
              const savedArchive = archiveService.saveArchive(obj)
              sendMessage({ chatId: reqBody.message.chat.id, text: `Screenshot received and is being processed. ${savedArchive._id}` })
              resolve(savedArchive)
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

    setTimeout(() => {
      deleteMessage({ chatId: reqBody.message.chat.id, messageId: reqBody.message.message_id })
    }, 15000)
  })
}

const deleteMessage = ({ chatId, messageId }) => {
  fetch(`${Endpoints.TELEGRAM_DELETE_MESSAGE}?chat_id=${chatId}&message_id=${messageId}`)
}

const sendMessage = ({ chatId, text }) => {
  fetch(`${Endpoints.TELEGRAM_SEND_MESSAGE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { chat_id: chatId, text }
  })
}

export const service = { webhook, deleteMessage }
