const STORAGE_KEY = 'crm-agent-explorer:s1-learned:v1'

export function readLearned(storage: Storage | undefined): Record<string, boolean> {
  try {
    const value = storage?.getItem(STORAGE_KEY)
    if (!value) return {}
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([key, learned]) => key.startsWith('node:') && learned === true))
  } catch {
    return {}
  }
}

export function writeLearned(storage: Storage | undefined, next: Record<string, boolean>): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(Object.entries(next).filter(([key, learned]) => key.startsWith('node:') && learned))))
  } catch {
    // Storage may be unavailable; React state remains the current-session source.
  }
}
