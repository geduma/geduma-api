export const microsoftHandler = {
  exchangeAndFetch: async ({ code, clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl }) => {
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'openid email profile User.Read'
      })
    })
    const tokenData = await tokenRes.json()

    const userRes = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    return {
      email: userData.mail || userData.userPrincipalName,
      displayName: userData.displayName,
      picture: null,
      rawData: userData
    }
  }
}
