import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Simple component tests
describe('Component rendering', () => {
  it('renders without crashing', () => {
    // Basic smoke test
    const TestComponent = () => <div>Test</div>
    render(<TestComponent />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})

describe('Store tests', () => {
  it('initializes with correct defaults', async () => {
    const { useStudyStore } = await import('../lib/store')
    const state = useStudyStore.getState()
    
    expect(state.uploadedChunks).toEqual([])
    expect(state.filename).toBeNull()
    expect(state.currentChunkIndex).toBe(0)
    expect(state.convertedContent).toEqual([])
    expect(state.isConverting).toBe(false)
    expect(state.tokenStatus).toBeNull()
  })

  it('sets uploaded data correctly', async () => {
    const { useStudyStore } = await import('../lib/store')
    
    useStudyStore.getState().setUploadedData(['chunk1', 'chunk2'], 'test.pdf')
    
    const state = useStudyStore.getState()
    expect(state.uploadedChunks).toEqual(['chunk1', 'chunk2'])
    expect(state.filename).toBe('test.pdf')
  })

  it('adds converted content', async () => {
    const { useStudyStore } = await import('../lib/store')
    
    const mockContent = {
      title: 'Test',
      hook: 'Hook',
      nuggets: [],
      quiz: { question: 'Q', options: ['A', 'B'], correct: 0, explanation: 'E' },
      tiktok_script: 'Script',
    }
    
    useStudyStore.getState().addConvertedContent(mockContent)
    
    const state = useStudyStore.getState()
    expect(state.convertedContent).toHaveLength(1)
    expect(state.convertedContent[0].title).toBe('Test')
  })

  it('resets state correctly', async () => {
    const { useStudyStore } = await import('../lib/store')
    
    // Set some data first
    useStudyStore.getState().setUploadedData(['chunk'], 'file.pdf')
    useStudyStore.getState().setIsConverting(true)
    
    // Reset
    useStudyStore.getState().reset()
    
    const state = useStudyStore.getState()
    expect(state.uploadedChunks).toEqual([])
    expect(state.filename).toBeNull()
    expect(state.isConverting).toBe(false)
  })
})

describe('i18n integration', () => {
  it('has all required translation keys', async () => {
    const en = await import('../locales/en/translation.json')
    const zh = await import('../locales/zh/translation.json')
    const ja = await import('../locales/ja/translation.json')
    const de = await import('../locales/de/translation.json')
    const fr = await import('../locales/fr/translation.json')
    const ko = await import('../locales/ko/translation.json')
    const es = await import('../locales/es/translation.json')

    // Check key structure exists in all languages
    const requiredKeys = ['nav', 'home', 'upload', 'study', 'card', 'pricing', 'success', 'privacy', 'terms']
    
    for (const key of requiredKeys) {
      expect(en.default).toHaveProperty(key)
      expect(zh.default).toHaveProperty(key)
      expect(ja.default).toHaveProperty(key)
      expect(de.default).toHaveProperty(key)
      expect(fr.default).toHaveProperty(key)
      expect(ko.default).toHaveProperty(key)
      expect(es.default).toHaveProperty(key)
    }
  })
})
