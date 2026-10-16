import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { KnowledgeMapEntry } from './SystemAtlasMilestoneA.tsx'
import { atlasModeForView } from './atlasViewModel.ts'

describe('S0-L knowledge map entry', () => {
  it('appears only beside the layered structure and switches the in-shell view', () => {
    expect(renderToStaticMarkup(createElement(KnowledgeMapEntry, { mode: 'overview' }))).toBe('')
    const layered = renderToStaticMarkup(createElement(KnowledgeMapEntry, { mode: 'layered' }))
    expect(layered).toContain('<button')
    expect(layered).not.toContain('href=')
    expect(layered).toContain('知识地图')
  })
})

describe('S1 return target', () => {
  it('keeps the layered atlas as the backing view for direct S1 links', () => {
    expect(atlasModeForView('s1')).toBe('layered')
    expect(atlasModeForView('layered')).toBe('layered')
    expect(atlasModeForView(null)).toBe('overview')
  })
})
