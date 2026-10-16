import { describe, expect, it } from 'vitest'
import { KnowledgeCardSchema, NodeSchema, RelationSchema } from '../../src/domain/content/schema.ts'
import { p1Objects, p1Relations } from './p1Fixture.ts'

describe('P1 current production schema diagnostics', () => {
  it('cannot directly express the P1 object taxonomy', () => {
    const results = p1Objects.map((object) => NodeSchema.safeParse({
      id: `node:${object.id.toLowerCase()}`,
      slug: object.id.toLowerCase(),
      name: object.label,
      kind: object.kind,
      primaryDomainId: 'domain:harness',
      summary: object.label,
    }))
    expect(results.every((result) => !result.success)).toBe(true)
  })

  it('only directly accepts uses among the six requested relation labels', () => {
    const requested = ['uses', 'part-of', 'applies', 'snapshots', 'queries', 'measures']
    const accepted = requested.filter((type) => RelationSchema.safeParse({
      id: `relation:test-${type}`,
      sourceNodeId: 'node:min-k01',
      targetNodeId: 'node:min-k02',
      type,
      label: type,
    }).success)
    expect(accepted).toEqual(['uses'])
  })

  it('rejects short and navigation-only cards because all seven-field storage is mandatory', () => {
    for (const object of p1Objects.filter(({ density }) => density !== 'full')) {
      expect(KnowledgeCardSchema.safeParse({
        id: `card:${object.id.toLowerCase()}`,
        nodeId: `node:${object.id.toLowerCase()}`,
        title: object.label,
        definition: object.sections?.definition,
      }).success).toBe(false)
    }
  })

  it('shows the complete relation vocabulary exceeds production enum', () => {
    const accepted = p1Relations.filter((relation) => RelationSchema.safeParse({
      id: `relation:${relation.id.toLowerCase()}`,
      sourceNodeId: `node:${relation.from.toLowerCase()}`,
      targetNodeId: `node:${relation.to.toLowerCase()}`,
      type: relation.type,
      label: relation.type,
    }).success)
    expect(accepted.map(({ id }) => id)).toEqual(['L01'])
  })
})
