import { describe, it, expect, vi, beforeEach } from 'vitest'
import { convertToBrainrot, getTokenStatus, uploadPDF } from '../lib/api'

describe('API functions', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getTokenStatus', () => {
    it('returns token status on success', async () => {
      const mockStatus = {
        total_tokens: 10,
        used_tokens: 3,
        remaining_tokens: 7,
        has_free_trial: true,
        free_trial_used: false,
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const result = await getTokenStatus()
      expect(result).toEqual(mockStatus)
    })

    it('throws error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: 'Error' }),
      })

      await expect(getTokenStatus()).rejects.toThrow('Failed to get token status')
    })
  })

  describe('convertToBrainrot', () => {
    it('returns brainrot content on success', async () => {
      const mockResponse = {
        success: true,
        content: {
          title: 'Test Title',
          hook: 'Test Hook',
          nuggets: [],
          quiz: { question: 'Q', options: ['A', 'B'], correct: 0, explanation: 'E' },
          tiktok_script: 'Script',
        },
        remaining_tokens: 5,
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await convertToBrainrot('test text', 'en')
      expect(result.success).toBe(true)
      expect(result.content.title).toBe('Test Title')
    })

    it('handles string error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      })

      await expect(convertToBrainrot('test', 'en')).rejects.toThrow('Something went wrong')
    })

    it('handles object error detail with error field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      })

      // Should NOT throw [object Object]
      await expect(convertToBrainrot('test', 'en')).rejects.toThrow('No tokens remaining')

      try {
        await convertToBrainrot('test', 'en')
      } catch (e: any) {
        expect(e.message).not.toContain('[object Object]')
        expect(e.message).not.toContain('object Object')
      }
    })

    it('handles object error detail with message field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input' },
        }),
      })

      await expect(convertToBrainrot('test', 'en')).rejects.toThrow('Invalid input')
    })

    it('handles empty object error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          detail: {},
        }),
      })

      await expect(convertToBrainrot('test', 'en')).rejects.toThrow('Conversion failed')
    })
  })

  describe('uploadPDF', () => {
    it('throws error for non-PDF error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: 'Only PDF files are supported' }),
      })

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      await expect(uploadPDF(file)).rejects.toThrow('Only PDF files are supported')
    })
  })
})
