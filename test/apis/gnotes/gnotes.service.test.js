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
    it('should return all notes sorted by updated desc', async () => {
      const expected = [
        { slug: 'b', updated: '2026-06-22' },
        { slug: 'a', updated: '2026-06-21' }
      ]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.getAll()
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith()
    })
  })

  describe('search', () => {
    it('should search across title, body and tags', async () => {
      const expected = [{ slug: 'test', title: 'Test Note' }]
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(expected)
      })

      const result = await service.search('test')
      expect(result).toEqual(expected)
      expect(mockFind).toHaveBeenCalledWith({
        $or: [
          { title: /test/i },
          { body: /test/i },
          { tags: /test/i }
        ]
      })
    })

    it('should return empty array when no matches', async () => {
      mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await service.search('nonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('should create a new note', async () => {
      const input = { slug: 'mi-nota', title: 'Mi nota', body: 'Hello', tags: ['tag1'], updated: '2026-06-22' }
      mockFindOne.mockResolvedValue(null)
      mockCreate.mockResolvedValue(input)

      const result = await service.create(input)
      expect(result).toEqual(input)
      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
      expect(mockCreate).toHaveBeenCalledWith(input)
    })

    it('should throw 409 if slug already exists', async () => {
      mockFindOne.mockResolvedValue({ slug: 'mi-nota', title: 'Existing' })

      await expect(service.create({ slug: 'mi-nota', title: 'Duplicate', updated: '2026-06-22' }))
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
        save: mockSave
      }
      mockFindOne.mockResolvedValue(note)
      mockSave.mockResolvedValue({
        ...note,
        title: 'New title',
        body: 'New body',
        updated: '2026-06-22'
      })

      const result = await service.update('mi-nota', { title: 'New title', body: 'New body', updated: '2026-06-22' })
      expect(result.title).toBe('New title')
      expect(result.body).toBe('New body')
      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
      expect(mockSave).toHaveBeenCalled()
    })

    it('should throw 404 if note not found', async () => {
      mockFindOne.mockResolvedValue(null)

      await expect(service.update('nonexistent', { title: 'New' }))
        .rejects.toThrow('Note not found')
    })

    it('should rename slug when newSlug is provided', async () => {
      const note = {
        slug: 'old-slug',
        title: 'Test',
        body: '',
        tags: [],
        updated: '2026-06-22',
        save: mockSave
      }
      mockFindOne.mockResolvedValueOnce(note)
      mockFindOne.mockResolvedValueOnce(null)
      mockSave.mockResolvedValue({ ...note, slug: 'new-slug' })

      const result = await service.update('old-slug', { newSlug: 'new-slug' })
      expect(result.slug).toBe('new-slug')
      expect(mockFindOne).toHaveBeenCalledTimes(2)
    })

    it('should throw 409 if newSlug conflicts with existing note', async () => {
      const note = {
        slug: 'old-slug',
        title: 'Test',
        save: mockSave
      }
      mockFindOne.mockResolvedValueOnce(note)
      mockFindOne.mockResolvedValueOnce({ slug: 'taken-slug' })

      await expect(service.update('old-slug', { newSlug: 'taken-slug' }))
        .rejects.toThrow('New slug already exists')

      expect(mockSave).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should delete a note and return success', async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 })

      const result = await service.remove('mi-nota')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).toHaveBeenCalledWith({ slug: 'mi-nota' })
    })

    it('should return success even when note does not exist', async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 0 })

      const result = await service.remove('nonexistent')
      expect(result).toEqual({ success: true })
      expect(mockDeleteOne).toHaveBeenCalledWith({ slug: 'nonexistent' })
    })
  })
})
