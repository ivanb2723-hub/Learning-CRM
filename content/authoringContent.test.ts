import { describe, expect, it } from 'vitest'

import { validateContent } from '../src/domain/content/validateContent.ts'
import { authoringContent } from './authoringContent.ts'

const expectedMainPath = [
  'node:b01-product-faq-request',
  'node:h01-request-reception',
  'node:h02-context',
  'node:h03-model-decision',
  'node:c01-product-faq-skill',
  'node:c10-knowledge-retrieval-tool',
  'node:h06-tool-execution',
  'node:c16-rag',
  'node:r03-knowledge-base',
  'node:r05-vector-store',
  'node:r02-model',
  'node:b02-product-faq-response',
] as const

describe('Phase 1 product FAQ / RAG content seed', () => {
  it('keeps available Harness nodes consistent with frozen Inventory 0.2 without migrating missing nodes', () => {
    const content = validateContent(authoringContent)
    const harness = content.nodes.filter(({ primaryDomainId }) => primaryDomainId === 'domain:harness')
    expect(harness.map(({ slug, name, weight }) => [slug.slice(0, 3), name, weight])).toEqual([
      ['h01', 'Request Reception', 'Standard'],
      ['h02', 'Context Assembly', 'Core'],
      ['h03', 'Model Decision', 'Core'],
      ['h04', 'Planning / Todo', 'Core'],
      ['h06', 'Tool & Execution', 'Core'],
      ['h07', 'Skill Discovery & Usage', 'Core'],
      ['h08', 'State & Checkpoint', 'Core'],
      ['h09', 'Memory', 'Core'],
    ])
    expect(content.nodes.some(({ slug }) => slug.startsWith('h05-'))).toBe(false)
    expect(JSON.stringify(content)).not.toContain('node:h07-answer-generation')
  })
  it('validates the frozen 4+1 topology and complete case main path', () => {
    const content = validateContent(authoringContent)
    const faqCase = content.cases.find(({ id }) => id === 'case:product-faq-rag')

    expect(content.domains.filter(({ kind }) => kind === 'core')).toHaveLength(4)
    expect(content.domains.filter(({ kind }) => kind === 'overlay')).toHaveLength(1)
    expect(faqCase?.steps.map(({ nodeId }) => nodeId)).toEqual(expectedMainPath)
  })

  it('keeps every case step on canonical nodes connected by canonical relations', () => {
    const content = validateContent(authoringContent)
    const faqCase = content.cases.find(({ id }) => id === 'case:product-faq-rag')
    const nodeIds = new Set(content.nodes.map(({ id }) => id))
    const relationIds = new Set(content.relations.map(({ id }) => id))

    expect(new Set(content.nodes.map(({ id }) => id)).size).toBe(
      content.nodes.length,
    )
    expect(faqCase).toBeDefined()
    expect(faqCase?.steps.every(({ nodeId }) => nodeIds.has(nodeId))).toBe(true)
    expect(
      faqCase?.steps
        .slice(1)
        .every(
          ({ viaRelationId }) =>
            viaRelationId !== undefined && relationIds.has(viaRelationId),
        ),
    ).toBe(true)
  })

  it('attaches concise learning, interview, evaluation, and evidence content', () => {
    const content = validateContent(authoringContent)
    const serializedContent = JSON.stringify(content)

    expect(content.knowledgeCards.length).toBeGreaterThanOrEqual(4)
    expect(content.interviewQuestions.length).toBeGreaterThanOrEqual(4)
    expect(content.evidence.length).toBeGreaterThanOrEqual(4)
    expect(
      content.nodes.filter(
        ({ primaryDomainId }) =>
          primaryDomainId === 'domain:governance-evaluation',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'node:g01-retrieval-quality' }),
        expect.objectContaining({ id: 'node:g02-faithfulness' }),
        expect.objectContaining({ id: 'node:g03-answer-quality' }),
      ]),
    )
    expect(serializedContent).toContain('Integration Test Fixture')
    expect(serializedContent).toContain('不能')
    expect(serializedContent).not.toContain('about 30 chunks')
  })
})
