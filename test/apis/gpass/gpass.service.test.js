import { describe, it, expect, vi } from 'vitest'

const mockFind = vi.fn()
const mockFindOne = vi.fn()
const mockCreate = vi.fn()
const mockFindById = vi.fn()
const mockFindByIdAndUpdate = vi.fn()
const mockDeleteOne = vi.fn()

vi.mock('../../../src/apis/gpass/models/gpass.model.js', () => ({
  default: {
    find: (...args) => mockFind(...args),
    findOne: (...args) => mockFindOne(...args),
    create: (...args) => mockCreate(...args),
    findById: (...args) => mockFindById(...args),
    findByIdAndUpdate: (...args) => mockFindByIdAndUpdate(...args),
    deleteOne: (...args) => mockDeleteOne(...args)
  }
}))

const { service } = await import('../../../src/apis/gpass/services/gpass.service.js')

describe('gpass.service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should throw 400 when owner is not provided', () => {
      expect(() => service.getAll())
        .toThrow('Owner query param is required')
    })

    it('should filter by owner when no q', async () => {
      const expected = [{ title: 'My Pass', owner: 'hash1' }]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.getAll('hash1')
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith({ owner: 'hash1' })
    })

    it('should search by title, username, or tags when q is provided', async () => {
      const expected = [{ title: 'test entry', owner: 'hash1' }]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.getAll('hash1', 'test')
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith({
        owner: 'hash1',
        $or: [
          { title: { $regex: 'test', $options: 'i' } },
          { username: { $regex: 'test', $options: 'i' } },
          { tags: { $regex: 'test', $options: 'i' } }
        ]
      })
    })

    it('should return empty array when owner has no entries', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await service.getAll('empty-hash')
      expect(result).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should throw 400 when owner is not provided', () => {
      expect(() => service.getById('some-id'))
        .toThrow('Owner query param is required')
    })

    it('should return entry by id and owner', async () => {
      const expected = { _id: '507f191e810c19729de860ea', title: 'Test', owner: 'hash1' }
      mockFindOne.mockResolvedValue(expected)

      const result = await service.getById('507f191e810c19729de860ea', 'hash1')
      expect(result).toEqual(expected)
      expect(mockFindOne).toHaveBeenCalledWith({ _id: '507f191e810c19729de860ea', owner: 'hash1' })
    })

    it('should return null when not found', async () => {
      mockFindOne.mockResolvedValue(null)

      const result = await service.getById('507f191e810c19729de860eb', 'hash1')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new entry', async () => {
      const input = {
        title: 'My Pass',
        username: 'user@example.com',
        password: 'encrypted-data',
        strength: 'strong',
        encrypted: 'enc123',
        iv: 'def456',
        owner: 'hash1'
      }
      mockCreate.mockResolvedValue({ _id: 'new-id', ...input })

      const result = await service.create(input)
      expect(result).toEqual({ _id: 'new-id', ...input })
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'My Pass',
        username: 'user@example.com',
        password: 'encrypted-data',
        strength: 'strong',
        encrypted: 'enc123',
        iv: 'def456',
        owner: 'hash1'
      })
    })
  })

  describe('update', () => {
    it('should update partial fields', async () => {
      const existing = {
        _id: '507f191e810c19729de860ea',
        title: 'Old Title',
        username: 'old@example.com',
        password: 'old-enc',
        strength: 'weak',
        encrypted: 'old-encrypted',
        iv: 'old-iv',
        owner: 'hash1'
      }
      mockFindById.mockResolvedValue(existing)
      mockFindByIdAndUpdate.mockResolvedValue({
        ...existing,
        title: 'New Title',
        strength: 'strong'
      })

      const result = await service.update('507f191e810c19729de860ea', { title: 'New Title', strength: 'strong' }, 'hash1')
      expect(result.title).toBe('New Title')
      expect(result.strength).toBe('strong')
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '507f191e810c19729de860ea',
        { $set: { title: 'New Title', strength: 'strong' } },
        { new: true, runValidators: true }
      )
    })

    it('should throw 404 if entry not found', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(service.update('507f191e810c19729de860eb', { title: 'New' }, 'hash1'))
        .rejects.toThrow('Entry not found')
    })

    it('should throw 400 if owner is missing', async () => {
      const existing = { _id: '507f191e810c19729de860ea', owner: 'hash1' }
      mockFindById.mockResolvedValue(existing)

      await expect(service.update('507f191e810c19729de860ea', { title: 'New' }, undefined))
        .rejects.toThrow('Owner is required')
    })

    it('should throw 403 if owner does not match', async () => {
      const existing = { _id: '507f191e810c19729de860ea', owner: 'hash1' }
      mockFindById.mockResolvedValue(existing)

      await expect(service.update('507f191e810c19729de860ea', { title: 'New' }, 'wrong-hash'))
        .rejects.toThrow('Forbidden: owner mismatch')
    })
  })

  describe('remove', () => {
    it('should delete entry when owner matches', async () => {
      mockFindById.mockResolvedValue({ _id: '507f191e810c19729de860ea', owner: 'hash1' })
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 })

      const result = await service.remove('507f191e810c19729de860ea', 'hash1')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).toHaveBeenCalledWith({ _id: '507f191e810c19729de860ea' })
    })

    it('should return success when entry does not exist', async () => {
      mockFindById.mockResolvedValue(null)

      const result = await service.remove('507f191e810c19729de860eb', 'hash1')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).not.toHaveBeenCalled()
    })

    it('should throw 400 if owner is missing', async () => {
      mockFindById.mockResolvedValue({ _id: '507f191e810c19729de860ea', owner: 'hash1' })

      await expect(service.remove('507f191e810c19729de860ea', undefined))
        .rejects.toThrow('Owner is required')
    })

    it('should throw 403 if owner does not match', async () => {
      mockFindById.mockResolvedValue({ _id: '507f191e810c19729de860ea', owner: 'hash1' })

      await expect(service.remove('507f191e810c19729de860ea', 'wrong-hash'))
        .rejects.toThrow('Forbidden: owner mismatch')

      expect(mockDeleteOne).not.toHaveBeenCalled()
    })
  })
})
