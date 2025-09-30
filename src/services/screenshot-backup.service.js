const webhook = ({ reqBody }) => {
  return `webhook service ${JSON.stringify(reqBody)}`
}

export const service = { webhook }
