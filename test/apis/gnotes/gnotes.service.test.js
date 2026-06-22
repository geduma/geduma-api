import { describe, it, expect, vi } from 'vitest'

const mockFind = vi.fn()
const mockFindOne = vi.fn()
const mockCreate = vi.fn()
const mockDeleteOne = vi.fn()
const mockSave = vi.fn()

vi.mock('../../../src/apis/gnotes/models/gnotes.model.js', () => ({
  default: {
    find: (...args) => mockFind(...args),
    findOne: (...args) => mockFindOne(...args),
    create: (...args) => mockCreate(...args),
    deleteOne: (...args) => mockDeleteOne(...args)
  }
}))

const { service } = await import('../../../src/apis/gnotes/services/gnotes.service.js')

describe('gnotes.service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should throw 400 when owner is not provided', () => {
      expect(() => service.getAll())
        .toThrow('Owner query param is required')
    })

    it('should filter by owner when owner is provided', async () => {
      const expected = [{ slug: 'mine', owner: 'hash1' }]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.getAll('hash1')
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith({ owner: 'hash1' })
    })

    it('should return empty array when owner has no notes', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await service.getAll('empty-hash')
      expect(result).toHaveLength(0)
    })
  })

  describe('search', () => {
    it('should throw 400 when owner is not provided', () => {
      expect(() => service.search('test'))
        .toThrow('Owner query param is required')
    })

    it('should filter by owner when owner is provided', async () => {
      const expected = [{ slug: 'test', owner: 'hash1' }]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.search('test', 'hash1')
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith({
        $or: [
          { title: /test/i },
          { body: /test/i },
          { tags: /test/i }
        ],
        owner: 'hash1'
      })
    })

    it('should return empty array when no matches', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await service.search('nonexistent', 'hash1')
      expect(result).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('should create a new note', async () => {
      const input = { slug: 'mi-nota', title: 'Mi nota', body: 'Hello', tags: ['tag1'], updated: '2026-06-22', owner: 'hash1' }
      mockFindOne.mockResolvedValue(null)
      mockCreate.mockResolvedValue(input)

      const result = await service.create(input)
      expect(result).toEqual(input)
      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
      expect(mockCreate).toHaveBeenCalledWith(input)
    })

    it('should throw 409 if slug already exists', async () => {
      mockFindOne.mockResolvedValue({ slug: 'mi-nota', title: 'Existing', owner: 'hash1' })

      await expect(service.create({ slug: 'mi-nota', title: 'Duplicate', updated: '2026-06-22', owner: 'hash1' }))
        .rejects.toThrow('Slug already exists')

      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update a note with partial data', async () => {
      const note = {
        slug: 'mi-nota',
        title: 'Old title',
        body: '',
        tags: [],
        updated: '2026-06-20',
        owner: 'hash1',
        save: mockSave
      }
      mockFindOne.mockResolvedValue(note)
      mockSave.mockResolvedValue({
        ...note,
        title: 'New title',
        body: 'New body',
        updated: '2026-06-22'
      })

      const result = await service.update('mi-nota', { title: 'New title', body: 'New body', updated: '2026-06-22' }, 'hash1')
      expect(result.title).toBe('New title')
      expect(result.body).toBe('New body')
      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
      expect(mockSave).toHaveBeenCalled()
    })

    it('should throw 404 if note not found', async () => {
      mockFindOne.mockResolvedValue(null)

      await expect(service.update('nonexistent', { title: 'New' }, 'hash1'))
        .rejects.toThrow('Note not found')
    })

    it('should rename slug when newSlug is provided', async () => {
      const note = {
        slug: 'old-slug',
        title: 'Test',
        body: '',
        tags: [],
        updated: '2026-06-22',
        owner: 'hash1',
        save: mockSave
      }
      mockFindOne.mockResolvedValueOnce(note)
      mockFindOne.mockResolvedValueOnce(null)
      mockSave.mockResolvedValue({ ...note, slug: 'new-slug' })

      const result = await service.update('old-slug', { newSlug: 'new-slug' }, 'hash1')
      expect(result.slug).toBe('new-slug')
      expect(mockFindOne).toHaveBeenCalledTimes(2)
    })

    it('should throw 409 if newSlug conflicts with existing note', async () => {
      const note = {
        slug: 'old-slug',
        title: 'Test',
        owner: 'hash1',
        save: mockSave
      }
      mockFindOne.mockResolvedValueOnce(note)
      mockFindOne.mockResolvedValueOnce({ slug: 'taken-slug', owner: 'hash2' })

      await expect(service.update('old-slug', { newSlug: 'taken-slug' }, 'hash1'))
        .rejects.toThrow('New slug already exists')

      expect(mockSave).not.toHaveBeenCalled()
    })

    it('should throw 400 if owner is missing', async () => {
      const note = { slug: 'test', owner: 'hash1', save: mockSave }
      mockFindOne.mockResolvedValue(note)

      await expect(service.update('test', { title: 'New' }, undefined))
        .rejects.toThrow('Owner is required')
    })

    it('should throw 403 if owner does not match', async () => {
      const note = { slug: 'test', owner: 'hash1', save: mockSave }
      mockFindOne.mockResolvedValue(note)

      await expect(service.update('test', { title: 'New' }, 'wrong-hash'))
        .rejects.toThrow('Forbidden: note owner mismatch')

      expect(mockSave).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should delete a note when owner matches', async () => {
      mockFindOne.mockResolvedValue({ slug: 'mi-nota', owner: 'hash1' })
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 })

      const result = await service.remove('mi-nota', 'hash1')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
    })

    it('should return success when note does not exist', async () => {
      mockFindOne.mockResolvedValue(null)

      const result = await service.remove('nonexistent', 'hash1')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).not.toHaveBeenCalled()
    })

    it('should throw 400 if owner is missing', async () => {
      mockFindOne.mockResolvedValue({ slug: 'test', owner: 'hash1' })

      await expect(service.remove('test', undefined))
        .rejects.toThrow('Owner is required')
    })

    it('should throw 403 if owner does not match', async () => {
      mockFindOne.mockResolvedValue({ slug: 'test', owner: 'hash1' })

      await expect(service.remove('test', 'wrong-hash'))
        .rejects.toThrow('Forbidden: note owner mismatch')

      expect(mockDeleteOne).not.toHaveBeenCalled()
    })
  })
})
