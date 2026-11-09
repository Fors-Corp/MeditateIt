/** Thin localStorage JSON helpers (async surface for a future IndexedDB swap). */

function canUseLocalStorage(): boolean {
  try {
    const probe = '__meditateit_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export async function readJson<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined' || !canUseLocalStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null || raw === '') return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  if (typeof window === 'undefined' || !canUseLocalStorage()) {
    throw new Error('localStorage unavailable')
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

export async function removeKey(key: string): Promise<void> {
  if (typeof window === 'undefined' || !canUseLocalStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
