import { describe, expect, it } from 'vitest'
import { S2_SECTIONS, nextS2Section, previousS2Section } from './s2Sections.ts'

describe('S2 master-detail sections', () => {
  it('defines the seven canonical knowledge dimensions in reading order', () => {
    expect(S2_SECTIONS.map(({ id }) => id)).toEqual([
      'definition', 'why', 'project', 'boundaries', 'case', 'interview', 'evidence',
    ])
  })

  it('moves between sections without wrapping past either end', () => {
    expect(previousS2Section('definition')).toBe('definition')
    expect(nextS2Section('definition')).toBe('why')
    expect(previousS2Section('project')).toBe('why')
    expect(nextS2Section('project')).toBe('boundaries')
    expect(nextS2Section('evidence')).toBe('evidence')
  })
})
