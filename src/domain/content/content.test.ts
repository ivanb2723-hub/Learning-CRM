import { describe, expect, it } from 'vitest'

import { authoringContent } from '../../../content/authoringContent.ts'
import { sourceIndex } from '../../../content/sourceIndex.ts'
import { validateContent, validateKnowledgeSystem } from './validateContent.ts'

describe('content consistency', () => {
  it('accepts the single-source knowledge system', () => {
    expect(validateKnowledgeSystem(authoringContent, sourceIndex)).toBeDefined()
  })

  it('rejects duplicate node identities', () => {
    const invalid = structuredClone(authoringContent)
    invalid.nodes.push(invalid.nodes[0]!)
    expect(() => validateContent(invalid)).toThrow('Duplicate Node id')
  })

  it('requires the frozen four-core and one-overlay topology', () => {
    const invalid = structuredClone(authoringContent)
    invalid.domains = invalid.domains.filter(({ id }) => id !== 'domain:harness')
    expect(() => validateContent(invalid)).toThrow(
      'Content must define exactly 4 core Domains and 1 overlay Domain',
    )
  })

  it('rejects relations that reference missing nodes', () => {
    const invalid = structuredClone(authoringContent)
    invalid.relations[0]!.targetNodeId = 'node:missing'
    expect(() => validateContent(invalid)).toThrow('references missing target Node')
  })

  it('rejects a discontinuous Case path', () => {
    const invalid = structuredClone(authoringContent)
    invalid.cases[0]!.steps[1]!.nodeId = 'node:h02-context'
    expect(() => validateContent(invalid)).toThrow('does not connect')
  })

  it('requires a Boundary Revision for revised boundaries', () => {
    const invalid = structuredClone(authoringContent)
    const boundary = invalid.knowledgeCards[0]!.boundaries[0]! as {
      status: string
    }
    boundary.status = 'revised'
    expect(() => validateContent(invalid)).toThrow('requires Boundary Revision')
  })

  it('rejects legacy Evidence prose and visibility fields', () => {
    const invalid = structuredClone(authoringContent) as unknown as {
      evidence: Array<Record<string, unknown>>
    }
    invalid.evidence[0]!.visibility = 'private'
    invalid.evidence[0]!.summary = 'legacy duplicated prose'
    expect(() => validateContent(invalid)).toThrow()
  })
})
