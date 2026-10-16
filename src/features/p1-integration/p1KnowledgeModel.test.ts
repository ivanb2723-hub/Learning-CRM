import { describe, expect, it } from 'vitest'
import { p1Case, p1Objects, p1Relations, readerForObject } from './p1KnowledgeModel.ts'

describe('P1 experimental knowledge projection', () => {
  it('uses stable object IDs and preserves relation semantics without creating a navigation parent tree', () => {
    expect(new Set(p1Objects.map(({ id }) => id)).size).toBe(p1Objects.length)
    expect(p1Relations.find(({ id }) => id === 'L09')).toMatchObject({ type: 'part-of', from: 'MIN-K08', to: 'MIN-K07' })
    expect(p1Relations.find(({ id }) => id === 'L10')).toMatchObject({ type: 'applies', from: 'MIN-K10', to: 'MIN-K07' })
    expect(p1Objects.find(({ id }) => id === 'MIN-K10')?.parentId).toBeUndefined()
  })

  it('exposes the exact three required reading densities', () => {
    const context = readerForObject('MIN-K03')
    const checkpoint = readerForObject('MIN-K05')
    const overview = readerForObject('MIN-SYS01')
    expect(context?.mode).toBe('seven-field')
    expect(context?.sections).toHaveLength(7)
    expect(context?.sections[2]?.body).toContain('具体某次调用选择了哪些 FAQ 片段')
    expect(checkpoint).toMatchObject({ mode: 'short' })
    expect(checkpoint?.sections.map(({ label }) => label)).toEqual(['是什么', '与谁有关', '不能推断'])
    expect(overview).toMatchObject({ mode: 'navigation', sections: [] })
  })

  it('keeps Case-01 a teaching walkthrough while referencing shared object identities', () => {
    expect(p1Case.kind).toBe('teaching-walkthrough')
    expect(p1Case.steps.flatMap(({ objectIds }) => objectIds)).toContain('MIN-K03')
    expect(p1Case.steps.some(({ evidenceStatus }) => evidenceStatus === 'not-reproduced')).toBe(true)
  })
})
