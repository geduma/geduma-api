export const githubHandler = {
  exchangeAndFetch: async ({ code, clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl }) => {
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    })
    const tokenData = await tokenRes.json()

    const userRes = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    return {
      email: userData.email,
      displayName: userData.name || userData.login,
      picture: userData.avatar_url,
      rawData: userData
    }
  }
}
