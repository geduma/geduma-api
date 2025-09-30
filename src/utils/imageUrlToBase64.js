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
}
