import sharp from 'sharp'

const FAVICON_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' rx='3' fill='#0d1117'/><path d='M4 5l3 3-3 3' stroke='#58a6ff' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M9 11h3' stroke='#58a6ff' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>`

const APPLE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='20' fill='#0d1117'/><path d='M30 40l25 20-25 20' stroke='#58a6ff' stroke-width='10' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M65 75h25' stroke='#58a6ff' stroke-width='10' fill='none' stroke-linecap='round'/></svg>`

const cache = new Map()

async function getOrCreate (key, svg, size, contentType) {
  if (cache.has(key)) return cache.get(key)
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
  const result = { buf, contentType }
  cache.set(key, result)
  return result
}

export const iconService = {
  async favicon () {
    return getOrCreate('favicon', FAVICON_SVG, 16, 'image/x-icon')
  },

  async appleTouch (size = 120) {
    const key = 'apple-' + size
    return getOrCreate(key, APPLE_SVG, size, 'image/png')
  },

  async warm () {
    await Promise.all([
      this.favicon(),
      this.appleTouch(120),
      this.appleTouch(180)
    ])
  }
}
