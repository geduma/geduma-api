import { describe, it, expect, vi } from 'vitest'

const mockFind = vi.fn()
const mockCreate = vi.fn()

vi.mock('../../../src/apis/short-url/models/custom-urls.model.js', () => ({
  default: {
    find: (...args) => mockFind(...args),
    create: (...args) => mockCreate(...args)
  }
}))

const { service } = await import('../../../src/apis/short-url/services/custom-url.service.js')

describe('custom-url.service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getByShort', () => {
    it('should find by shortUrl', async () => {
      mockFind.mockResolvedValue([{ shortUrl: 'abc123', originUrl: 'https://example.com' }])

      const result = await service.getByShort({ id: 'abc123' })
      expect(result).toHaveLength(1)
      expect(mockFind).toHaveBeenCalledWith({ shortUrl: 'abc123' })
    })
  })

  describe('saveUrl', () => {
    it('should create with default project', async () => {
      mockCreate.mockResolvedValue({ originUrl: 'https://example.com', shortUrl: 'abc123', project: 'default' })

      const result = await service.saveUrl({ originUrl: 'https://example.com', shortUrl: 'abc123' })
      expect(result.project).toBe('default')
      expect(mockCreate).toHaveBeenCalledWith({ originUrl: 'https://example.com', shortUrl: 'abc123', project: 'default' })
    })
  })

  describe('saveUrlByProject', () => {
    it('should create with custom project', async () => {
      mockCreate.mockResolvedValue({ originUrl: 'https://example.com', shortUrl: 'abc123', project: 'my-project' })

      const result = await service.saveUrlByProject({ originUrl: 'https://example.com', shortUrl: 'abc123', project: 'my-project' })
      expect(result.project).toBe('my-project')
      expect(mockCreate).toHaveBeenCalledWith({ originUrl: 'https://example.com', shortUrl: 'abc123', project: 'my-project' })
    })
  })
})
