import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedDeviceId: string | null = null

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId
  }

  // Check localStorage first
  const stored = localStorage.getItem('brainrot_device_id')
  if (stored) {
    cachedDeviceId = stored
    return stored
  }

  // Generate new fingerprint
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  const deviceId = result.visitorId

  // Store for future use
  localStorage.setItem('brainrot_device_id', deviceId)
  cachedDeviceId = deviceId

  return deviceId
}
