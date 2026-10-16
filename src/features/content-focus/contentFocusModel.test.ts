import { describe, expect, it } from 'vitest'
import { content, sources } from '../../domain/content/content.ts'
import { buildDomainFocus, buildNodeFocus } from './contentFocusModel.ts'

describe('generic content focus model', () => {
  it('lists available canonical Harness nodes with weights and card status', () => {
    const focus = buildDomainFocus(content, 'domain:harness')
    expect(focus.domain.name).toBe('Agent Runtime / Harness')
    expect(focus.nodes.map(({ node }) => node.id)).toContain('node:h02-context')
    expect(focus.nodes.some(({ node }) => node.id.startsWith('node:h05-'))).toBe(false)
    expect(focus.nodes.find(({ node }) => node.id === 'node:h02-context')?.card?.reviewStatus).toBe('frozen')
    expect(focus.nodes.find(({ node }) => node.id === 'node:h02-context')?.node.weight).toBe('Core')
  })

  it('resolves H02 evidence and reuses the same model for H06', () => {
    const h02 = buildNodeFocus(content, sources, 'node:h02-context')
    const h06 = buildNodeFocus(content, sources, 'node:h06-tool-execution')
    expect(h02.card?.boundaries).toHaveLength(3)
    expect(h02.evidence.map(({ source }) => source.sourceType)).toEqual(
      expect.arrayContaining(['course', 'project', 'jd', 'interview']),
    )
    expect(h06.card?.title).toBe('H06 Tool & Execution')
    expect(h06.evidence.length).toBeGreaterThan(0)
  })

  it('shows a canonical node without inventing a missing card', () => {
    const h01 = buildNodeFocus(content, sources, 'node:h01-request-reception')
    expect(h01.node.name).toBe('Request Reception')
    expect(h01.card).toBeUndefined()
    expect(h01.evidence).toEqual([])
  })
})
