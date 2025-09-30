import { Constants } from '../constants/constants.js'
import { Endpoints } from '../constants/endpoints.js'

export const generateReport = (screenShotList) => {
  let html = Constants.INIT_HTML

  screenShotList.forEach(item => {
    let tableItem = '<tr><th>'
    tableItem += `<p style="text-align: left;width: 100%;font-weight: 200;margin-top: 0;margin-bottom: 0;"><strong style="font-weight: 600;">Fecha: </strong>${item.backupDateString}</p>`
    tableItem += `<p style="text-align: left;width: 100%;font-weight: 200;margin-top: 0;margin-bottom: 0;"><strong style="font-weight: 600;">Descripción: </strong>${item.textMessage}</p>`
    tableItem += `<img alt="screen-shot-backup-item" style="width: 60%;margin-top: 0.5rem;margin-bottom: 1rem;" src="${Endpoints.TELEGRAM_FILE_BASE_URL}/${item.filePath}"></th></tr>`
    html += tableItem
  })

  return html + Constants.END_HTML
}
