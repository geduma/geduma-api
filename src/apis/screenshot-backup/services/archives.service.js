import archivesSchema from '../models/archives.model.js'

const getSummary = async ({ schema }) => {
  const data = await archivesSchema.find({ schema }).sort('backupDate')
  return JSON.parse(JSON.stringify(data)).map(item => {
    item.backupDateString = new Date(item.backupDate).toLocaleString('en-US', { timeZone: 'America/Bogota' })
    return item
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

const deleteArchive = ({ id }) => {
  return archivesSchema.deleteOne({ _id: id })
}

export const service = { getSummary, saveArchive, deleteArchive }
