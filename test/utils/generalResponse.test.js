import { describe, it, expect } from 'vitest'
import { generalResponse } from '../../src/utils/generalResponse.js'

describe('generalResponse', () => {
  describe('ok', () => {
    it('should return success response with data', () => {
      const result = generalResponse.ok({ id: 1 })
      expect(result).toEqual({ ok: true, msg: 'Success', data: { id: 1 } })
    })

    it('should return success response with array', () => {
      const result = generalResponse.ok([1, 2, 3])
      expect(result).toEqual({ ok: true, msg: 'Success', data: [1, 2, 3] })
    })

    it('should return success response with null data', () => {
      const result = generalResponse.ok(null)
      expect(result).toEqual({ ok: true, msg: 'Success', data: null })
    })
  })

  describe('info', () => {
    it('should return info response with message and custom data', () => {
      const result = generalResponse.info('Not found', { id: 1 })
      expect(result).toEqual({ ok: false, msg: 'Not found', data: { id: 1 } })
    })

    it('should return info response with empty array when data is null', () => {
      const result = generalResponse.info('Not found')
      expect(result).toEqual({ ok: false, msg: 'Not found', data: [] })
    })
  })

  describe('error', () => {
    it('should return error response with message', () => {
      const result = generalResponse.error('Something went wrong')
      expect(result).toEqual({ ok: false, msg: 'Something went wrong', data: [] })
    })
  })
})
