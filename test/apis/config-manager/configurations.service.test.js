import { describe, it, expect, vi } from 'vitest'

const mockFind = vi.fn()

vi.mock('../../../src/apis/config-manager/models/configurations.model.js', () => ({
  default: {
    find: (...args) => mockFind(...args)
  }
}))

const { service } = await import('../../../src/apis/config-manager/services/configurations.service.js')

describe('configurations.service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all configurations', async () => {
      const expected = [{ owner: 'test', name: 'config1' }]
      mockFind.mockResolvedValue(expected)

      const result = await service.getAll()
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith()
    })
  })

  describe('getByOwner', () => {
    it('should filter by owner', async () => {
      mockFind.mockResolvedValue([{ owner: 'test' }])

      const result = await service.getByOwner({ ownerStr: 'test' })
      expect(result).toHaveLength(1)
      expect(mockFind).toHaveBeenCalledWith({ owner: 'test' })
    })
  })

  describe('getBySchema', () => {
    it('should filter by owner and schema', async () => {
      mockFind.mockResolvedValue([])

      const result = await service.getBySchema({ ownerStr: 'test', schemaStr: 'dev' })
      expect(result).toHaveLength(0)
      expect(mockFind).toHaveBeenCalledWith({ owner: 'test', schema: 'dev' })
    })
  })

  describe('getByName', () => {
    it('should filter by owner, schema and name', async () => {
      mockFind.mockResolvedValue([{ name: 'my-config' }])

      const result = await service.getByName({ ownerStr: 'test', schemaStr: 'dev', nameStr: 'my-config' })
      expect(result).toHaveLength(1)
      expect(mockFind).toHaveBeenCalledWith({ owner: 'test', schema: 'dev', name: 'my-config' })
    })
  })
})
