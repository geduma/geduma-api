import sharp from 'sharp'

export const imageUrlToBase64 = (imageUrl) => {
  console.log(imageUrl)
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const imageBuffer = Buffer.from(arrayBuffer)

        try {
          sharp(imageBuffer)
            .webp({ quality: 70 })
            .toBuffer()
            .then(compressedBuffer => {
              const compressedBase64 = compressedBuffer.toString('base64')
              resolve(`data:image/webp;base64,${compressedBase64}`)
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
