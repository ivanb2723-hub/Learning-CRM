import { describe, expect, it } from 'vitest'
import { readLearned, writeLearned } from './s1LearningState.ts'

function memoryStorage(initial: string | null = null): Storage {
  const entries = new Map<string, string>()
  if (initial !== null) entries.set('crm-agent-explorer:s1-learned:v1', initial)
  return {
    get length() { return entries.size },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => { entries.delete(key) },
    setItem: (key, value) => { entries.set(key, value) },
  }
}

describe('S1 learning check-in persistence', () => {
  it('starts empty, persists check-in, and persists undo', () => {
    const storage = memoryStorage()
    expect(readLearned(storage)).toEqual({})
    writeLearned(storage, { 'node:h02-context': true })
    expect(readLearned(storage)).toEqual({ 'node:h02-context': true })
    writeLearned(storage, {})
    expect(readLearned(storage)).toEqual({})
  })

  it('treats malformed storage as empty and does not propagate unavailable storage errors', () => {
    expect(readLearned(memoryStorage('{broken'))).toEqual({})
    expect(readLearned(undefined)).toEqual({})
    const unavailable = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    } as unknown as Storage
    expect(readLearned(unavailable)).toEqual({})
    expect(() => writeLearned(unavailable, { 'node:h02-context': true })).not.toThrow()
  })
})
