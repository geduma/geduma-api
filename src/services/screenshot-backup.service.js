const gedumaWebhook = ({ reqBody }) => {
  return `geduma webhook service ${JSON.stringify(reqBody)}`
}

export const service = { gedumaWebhook }
