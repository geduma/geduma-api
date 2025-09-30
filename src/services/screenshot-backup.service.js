import archivesSchema from '../models/screenshot-backup/archives.model.js'

const getSummary = ({ schema }) => {
  return archivesSchema.find({
    schema
  })
}

const gedumaWebhook = ({ reqBody }) => {
  console.log(reqBody)
  const obj = {}

  obj.schema = 'geduma'
  obj.userName = reqBody.channel_post.sender_chat.username || 'unknown'
  obj.backupDate = reqBody.channel_post.date || Date.now()
  obj.filePath = ''
  obj.textMessage = reqBody.channel_post.text || ''
  obj.screenShotData = '<base64_encoded_image>'

  return saveArchive(obj)
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
