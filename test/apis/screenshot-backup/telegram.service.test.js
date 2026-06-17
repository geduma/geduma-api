import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDeleteArchive = vi.fn()
const mockSaveArchive = vi.fn()

vi.mock('../../../src/apis/screenshot-backup/services/archives.service.js', () => ({
  service: {
    deleteArchive: (...args) => mockDeleteArchive(...args),
    saveArchive: (...args) => mockSaveArchive(...args)
  }
}))

// Mock endpoints to avoid env dependency
vi.mock('../../../src/constants/endpoints.js', () => ({
  Endpoints: {
    TELEGRAM_GET_FILE: 'https://api.telegram.org/bot123/getFile',
    TELEGRAM_FILE_BASE_URL: 'https://api.telegram.org/file/bot123',
    TELEGRAM_DELETE_MESSAGE: 'https://api.telegram.org/bot123/deleteMessage',
    TELEGRAM_SEND_MESSAGE: 'https://api.telegram.org/bot123/sendMessage'
  }
}))

vi.mock('../../../src/utils/imageUrlToBase64.js', () => ({
  imageUrlToBase64: () => Promise.resolve('data:image/webp;base64,mockedBase64')
}))

const { service } = await import('../../../src/apis/screenshot-backup/services/telegram.service.js')

describe('telegram.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('webhook', () => {
    it('should handle delete command', async () => {
      mockDeleteArchive.mockResolvedValue({ deletedCount: 1 })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })

      const reqBody = {
        message: {
          from: { username: 'testuser' },
          chat: { id: 12345 },
          message_id: 678,
          text: 'delete abc123',
          photo: []
        }
      }

      const result = await service.webhook({ reqBody })
      expect(result).toEqual({ message: 'Delete request processed' })
      expect(mockDeleteArchive).toHaveBeenCalledWith({ id: 'abc123' })
      expect(global.fetch).toHaveBeenCalledTimes(1) // sendMessage
    })

    it('should process photo message', async () => {
      mockSaveArchive.mockResolvedValue({ _id: 'saved' })
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ ok: true, result: { file_path: 'photos/photo.jpg' } })
        })
        .mockResolvedValueOnce({
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(10))
        })

      const reqBody = {
        message: {
          from: { username: 'photouser' },
          chat: { id: 12345 },
          message_id: 679,
          text: '',
          caption: 'my photo',
          photo: [
            { file_id: 'small', file_size: 100 },
            { file_id: 'large', file_size: 500 }
          ]
        }
      }

      const result = await service.webhook({ reqBody })
      expect(result).toEqual({})
      expect(mockSaveArchive).toHaveBeenCalled()
    })

    it('should handle message without photo and no delete command', async () => {
      const reqBody = {
        message: {
          from: { username: 'testuser' },
          chat: { id: 12345 },
          message_id: 680,
          text: 'just a text',
          photo: []
        }
      }

      const result = await service.webhook({ reqBody })
      expect(result).toEqual({})
    })
  })
})
