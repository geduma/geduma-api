import { Endpoints } from '../../../constants/endpoints.js'
import { imageUrlToBase64 } from '../../../utils/imageUrlToBase64.js'
import { service as archiveService } from './archives.service.js'

const webhook = async ({ reqBody, schema }) => {
  const obj = {}

  obj.schema = schema || 'geduma'
  obj.userName = reqBody.message.from.username || 'unknown'
  obj.backupDate = new Date().getTime()
  obj.textMessage = reqBody.message.text || reqBody.message.caption || ''

  if (obj.textMessage.includes('delete')) {
    const id = obj.textMessage.split('delete ')[1]
    await archiveService.deleteArchive({ id })
    await sendMessage({ chatId: reqBody.message.chat.id, text: `Requested deletion of archive ID: ${id}` })
    return { message: 'Delete request processed' }
  }

  if (reqBody.message.photo && reqBody.message.photo.length > 0) {
    const imgObj = reqBody.message.photo.reduce((a, b) => {
      return a.file_size > b.file_size ? a : b
    }, reqBody.message.photo[0])

    const res = await fetch(`${Endpoints.TELEGRAM_GET_FILE}?file_id=${imgObj.file_id}`)
    const data = await res.json()
    obj.filePath = data.result.file_path
    const base64 = await imageUrlToBase64(`${Endpoints.TELEGRAM_FILE_BASE_URL}/${obj.filePath}`)
    obj.screenShotData = base64
    await archiveService.saveArchive(obj)
  }

  setTimeout(() => {
    deleteMessage({ chatId: reqBody.message.chat.id, messageId: reqBody.message.message_id })
  }, 15000)

  return {}
}

const deleteMessage = ({ chatId, messageId }) => {
  return fetch(`${Endpoints.TELEGRAM_DELETE_MESSAGE}?chat_id=${chatId}&message_id=${messageId}`)
}

const sendMessage = ({ chatId, text }) => {
  return fetch(`${Endpoints.TELEGRAM_SEND_MESSAGE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  })
}

export const service = { webhook, deleteMessage }
