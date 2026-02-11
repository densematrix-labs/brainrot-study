import { create } from 'zustand'
import type { BrainrotContent, TokenStatus } from './api'

interface StudyState {
  // Upload state
  uploadedChunks: string[]
  filename: string | null
  
  // Conversion state
  currentChunkIndex: number
  convertedContent: BrainrotContent[]
  isConverting: boolean
  
  // Token state
  tokenStatus: TokenStatus | null
  
  // Actions
  setUploadedData: (chunks: string[], filename: string) => void
  addConvertedContent: (content: BrainrotContent) => void
  setIsConverting: (converting: boolean) => void
  nextChunk: () => void
  setTokenStatus: (status: TokenStatus) => void
  reset: () => void
}

export const useStudyStore = create<StudyState>((set) => ({
  uploadedChunks: [],
  filename: null,
  currentChunkIndex: 0,
  convertedContent: [],
  isConverting: false,
  tokenStatus: null,

  setUploadedData: (chunks, filename) => set({
    uploadedChunks: chunks,
    filename,
    currentChunkIndex: 0,
    convertedContent: [],
  }),

  addConvertedContent: (content) => set((state) => ({
    convertedContent: [...state.convertedContent, content],
  })),

  setIsConverting: (converting) => set({ isConverting: converting }),

  nextChunk: () => set((state) => ({
    currentChunkIndex: state.currentChunkIndex + 1,
  })),

  setTokenStatus: (status) => set({ tokenStatus: status }),

  reset: () => set({
    uploadedChunks: [],
    filename: null,
    currentChunkIndex: 0,
    convertedContent: [],
    isConverting: false,
  }),
}))
