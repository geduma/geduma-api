import archivesSchema from '../models/archives.model.js'

const getSummary = ({ schema }) => {
  return new Promise((resolve, reject) => {
    archivesSchema.find({ schema })
      .sort('backupDate')
      .then(data => {
        const summaryList = JSON.parse(JSON.stringify(data))
        resolve(summaryList.map(item => {
          item.backupDateString = new Date(item.backupDate).toLocaleString('en-US', { timeZone: 'America/Bogota' })
          return item
        }))
      })
      .catch(err => reject(err))
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

export const service = { getSummary, saveArchive }
