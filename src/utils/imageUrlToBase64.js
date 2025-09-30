import sharp from 'sharp'

export const imageUrlToBase64 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then(response => response.arrayBuffer())
      .then(imageBuffer => {
        try {
          sharp(imageBuffer)
            .jpeg({ quality: 80 })
            .toBuffer()
            .then(compressedBuffer => {
              const compressedBase64 = compressedBuffer.toString('base64')
              resolve(`data:image/jpeg;base64,${compressedBase64}`)
            })
        } catch (err) {
          console.error(err)
          reject(err)
        }
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
  })
}
