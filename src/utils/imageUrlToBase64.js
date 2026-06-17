import sharp from 'sharp'

export const imageUrlToBase64 = async (imageUrl) => {
  const response = await fetch(imageUrl)
  const arrayBuffer = await response.arrayBuffer()
  const imageBuffer = Buffer.from(arrayBuffer)
  const compressedBuffer = await sharp(imageBuffer)
    .webp({ quality: 70 })
    .toBuffer()
  const compressedBase64 = compressedBuffer.toString('base64')
  return `data:image/webp;base64,${compressedBase64}`
}
