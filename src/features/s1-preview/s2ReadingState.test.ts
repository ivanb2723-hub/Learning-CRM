import { describe, expect, it } from 'vitest'
import { reduceS2Reading } from './s2ReadingState.ts'

describe('H02 S2+ reading path', () => {
  it('opens only from H02 Attached Card and closes back to that Card', () => {
    expect(reduceS2Reading(false, { type: 'open', nodeCode: 'H05', cardOpen: true })).toBe(false)
    expect(reduceS2Reading(false, { type: 'open', nodeCode: 'H02', cardOpen: false })).toBe(false)
    const opened = reduceS2Reading(false, { type: 'open', nodeCode: 'H02', cardOpen: true })
    expect(opened).toBe(true)
    expect(reduceS2Reading(opened, { type: 'close' })).toBe(false)
  })

  it('opens an explicitly eligible experimental reader without weakening the legacy H02 gate', () => {
    expect(reduceS2Reading(false, { type: 'open', nodeCode: 'MIN-K03', cardOpen: true, eligible: true })).toBe(true)
    expect(reduceS2Reading(false, { type: 'open', nodeCode: 'MIN-K03', cardOpen: true })).toBe(false)
  })
})
