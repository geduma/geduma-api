export const imageUrlToBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/png'

    return `data:${mimeType};base64,${base64}`
  } catch (err) {
    console.error('Error converting image URL to Base64:', err)
    throw err
  }
}
