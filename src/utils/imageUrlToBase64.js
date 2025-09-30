export const imageUrlToBase64 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const base64String = btoa(
          new Uint8Array(buffer)
            .reduce((data, byte) =>
              data + String.fromCharCode(byte), '')
        )
        resolve(`data:image/png;base64,${base64String}`)
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
  })
  // try {
  //   const response = await fetch(imageUrl)
  //   const arrayBuffer = await response.arrayBuffer()
  //   const base64 = Buffer.from(arrayBuffer).toString('base64')
  //   const mimeType = response.headers.get('content-type') || 'image/png'
  //   console.log(`data:${mimeType};base64,${base64}`)

  //   return `data:${mimeType};base64,${base64}`
  // } catch (err) {
  //   console.error('Error converting image URL to Base64:', err)
  //   throw err
  // }
}
