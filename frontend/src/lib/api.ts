import { getDeviceId } from './fingerprint'

const API_BASE = '/api/v1'

export interface UploadResponse {
  success: boolean
  filename: string
  page_count: number
  chunk_count: number
  preview: string
  chunks: string[]
}

export interface BrainrotContent {
  title: string
  hook: string
  nuggets: Array<{
    fact: string
    vibe: string
    emoji: string
  }>
  quiz: {
    question: string
    options: string[]
    correct: number
    explanation: string
  }
  tiktok_script: string
}

export interface ConvertResponse {
  success: boolean
  content: BrainrotContent
  remaining_tokens: number
}

export interface TokenStatus {
  total_tokens: number
  used_tokens: number
  remaining_tokens: number
  has_free_trial: boolean
  free_trial_used: boolean
}

export async function uploadPDF(file: File): Promise<UploadResponse> {
  const deviceId = await getDeviceId()
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'X-Device-Id': deviceId,
    },
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Upload failed'
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function convertToBrainrot(text: string, language: string): Promise<ConvertResponse> {
  const deviceId = await getDeviceId()

  const response = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ text, language }),
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Conversion failed'
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function getTokenStatus(): Promise<TokenStatus> {
  const deviceId = await getDeviceId()

  const response = await fetch(`${API_BASE}/tokens`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get token status')
  }

  return response.json()
}

export async function getTTS(text: string, language: string): Promise<Blob> {
  const deviceId = await getDeviceId()
  const params = new URLSearchParams({ text, language })

  const response = await fetch(`${API_BASE}/tts?${params}`, {
    method: 'POST',
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('TTS generation failed')
  }

  return response.blob()
}

export interface Product {
  id: string
  name: string
  tokens: number
  price: number
  currency: string
}

export async function getProducts(): Promise<{ products: Product[] }> {
  const response = await fetch(`${API_BASE}/payment/products`)
  if (!response.ok) {
    throw new Error('Failed to get products')
  }
  return response.json()
}

export async function createCheckout(productId: string): Promise<{ checkout_url: string }> {
  const deviceId = await getDeviceId()
  const successUrl = `${window.location.origin}/payment/success`

  const response = await fetch(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      device_id: deviceId,
      success_url: successUrl,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Checkout failed'
    throw new Error(errorMessage)
  }

  return response.json()
}
