import { describe, it, expect, vi } from 'vitest'

const mockFind = vi.fn()
const mockCreate = vi.fn()
const mockDeleteOne = vi.fn()

vi.mock('../../../src/apis/screenshot-backup/models/archives.model.js', () => ({
  default: {
    find: (...args) => mockFind(...args),
    create: (...args) => mockCreate(...args),
    deleteOne: (...args) => mockDeleteOne(...args)
  }
}))

const { service } = await import('../../../src/apis/screenshot-backup/services/archives.service.js')

describe('archives.service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getSummary', () => {
    it('should find by schema sorted by backupDate', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([
          { backupDate: 1718600000000, schema: 'geduma', userName: 'testuser', filePath: 'path.jpg', textMessage: 'test', screenShotData: 'data:base64' }
        ])
      })

      const result = await service.getSummary({ schema: 'geduma' })
      expect(result).toHaveLength(1)
      expect(result[0].backupDateString).toBeDefined()
      expect(mockFind).toHaveBeenCalledWith({ schema: 'geduma' })
    })

    it('should return empty array for no results', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await service.getSummary({ schema: 'nonexistent' })
      expect(result).toHaveLength(0)
    })
  })

  describe('saveArchive', () => {
    it('should create archive', async () => {
      const archiveData = {
        schema: 'geduma',
        userName: 'testuser',
        filePath: 'path.jpg',
        textMessage: 'test',
        screenShotData: 'data:image/webp;base64,abc'
      }
      mockCreate.mockResolvedValue(archiveData)

      const result = await service.saveArchive(archiveData)
      expect(result).toEqual(archiveData)
      expect(mockCreate).toHaveBeenCalledWith(archiveData)
    })
  })

  describe('deleteArchive', () => {
    it('should delete by id', async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 })

      const result = await service.deleteArchive({ id: '507f1f77bcf86cd799439011' })
      expect(result.deletedCount).toBe(1)
      expect(mockDeleteOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' })
    })
  })
})
