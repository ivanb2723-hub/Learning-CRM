import { describe, expect, it } from 'vitest'

import { authoringContent } from '../../../content/authoringContent.ts'
import { sourceIndex } from '../../../content/sourceIndex.ts'
import { validateKnowledgeSystem } from './validateContent.ts'

describe('production knowledge constraints', () => {
  it('renders formal H02 as the sole newly frozen card with typed evidence', () => {
    const { content, sources } = validateKnowledgeSystem(authoringContent, sourceIndex)
    const h02 = content.knowledgeCards.find(({ id }) => id === 'card:h02-context')
    const h06 = content.knowledgeCards.find(({ id }) => id === 'card:h06-tool-execution')
    expect(h02?.reviewStatus).toBe('frozen')
    expect(h02?.preview).toEqual({
      definition: 'Harness 在模型每轮决策前，将所需的系统规则、历史消息、工具定义、Skill 信息和相关 Memory 组织为当前运行时 Context。',
      mechanism: '信息来源 → 选择 / 裁剪 / 排序 / 注入 → Model API',
    })
    expect(h02?.definition).toBe('Context Assembly（上下文组装）是 Harness 在模型每轮决策前，选择、裁剪、排序和注入这一步真正需要的系统规则、对话历史、工具信息、Skill 信息及相关 Memory，组成模型这一轮实际可见的运行时 Context。')
    expect(h02?.mechanism).toBe('System Prompt、Conversation History、Tool Definitions、Skill Index 和 Relevant Memory → Context Assembly（选择／裁剪／排序／注入）→ Runtime Context → Model API。这里只描述每轮模型决策前的信息准备，不补未证实的算法细节或后续 Tool 执行。')
    expect(h02?.why.industry).toBeUndefined()
    expect(h02?.boundaries.map(({ title, status }) => [title, status])).toEqual([
      ['Context ≠ Memory', 'frozen'],
      ['Context ≠ System Prompt', 'frozen'],
      ['Context ≠ Context Window', 'frozen'],
    ])
    expect(h02?.interviewLens).toHaveLength(5)
    expect(h02?.evidenceRefs.map(({ sourceLayer }) => sourceLayer)).toEqual(
      expect.arrayContaining(['course', 'project', 'jd', 'interview']),
    )
    expect(sources.some(({ location }) => location.includes('Harness入门（下）.pptx#slide=4'))).toBe(true)
    expect(sources.some(({ location }) => location.includes('Harness入门（下）.pptx#slide=7'))).toBe(true)
    expect(h06?.reviewStatus).toBe('reviewed')
    expect(h06?.preview).toBeUndefined()
  })
  it('aligns protected Inventory 0.2 ownership and excludes C13', () => {
    const { content } = validateKnowledgeSystem(authoringContent, sourceIndex)
    const domainByNodeId = new Map(
      content.nodes.map((node) => [node.id, node.primaryDomainId]),
    )

    expect(domainByNodeId.get('node:b09-proactive-agent')).toBe('domain:business')
    expect(domainByNodeId.get('node:h02-context')).toBe('domain:harness')
    expect(domainByNodeId.get('node:h06-tool-execution')).toBe('domain:harness')
    expect(domainByNodeId.get('node:h08-state-checkpoint')).toBe('domain:harness')
    expect(domainByNodeId.get('node:h09-memory')).toBe('domain:harness')
    expect(domainByNodeId.get('node:c10-knowledge-retrieval-tool')).toBe(
      'domain:capability',
    )
    expect(domainByNodeId.get('node:c16-rag')).toBe('domain:capability')
    expect(domainByNodeId.get('node:r08-long-term-memory-store')).toBe(
      'domain:resources',
    )
    expect(domainByNodeId.get('node:r09-state-checkpoint-store')).toBe(
      'domain:resources',
    )
    expect(domainByNodeId.get('node:r10-mcp')).toBe('domain:resources')
    expect(content.nodes.some(({ name }) => name === 'Service Info Tool')).toBe(false)
  })

  it('resolves every H02/H06 claim and evidence reference to a typed source fragment', () => {
    const { content, sources } = validateKnowledgeSystem(
      authoringContent,
      sourceIndex,
    )
    const cards = content.knowledgeCards.filter(({ nodeId }) =>
      ['node:h02-context', 'node:h06-tool-execution'].includes(nodeId),
    )
    const sourceById = new Map(sources.map((source) => [source.fragmentId, source]))

    expect(cards).toHaveLength(2)
    for (const card of cards) {
      expect(card.why.course).toEqual(expect.any(String))
      expect(card.why.project).toEqual(expect.any(String))
      if (card.id === 'card:h02-context') expect(card.why.industry).toBeUndefined()
      expect(card.boundaries.length).toBeLessThanOrEqual(3)
      for (const claim of card.claims) {
        for (const fragmentId of claim.sourceFragmentIds) {
          expect(sourceById.get(fragmentId)?.sourceType).toBe(claim.sourceLayer)
        }
      }
    }
  })

  it('protects the exact frozen boundary names', () => {
    const { content } = validateKnowledgeSystem(authoringContent, sourceIndex)
    const frozenTitles = content.knowledgeCards.flatMap((card) =>
      card.boundaries
        .filter(({ status }) => status === 'frozen')
        .map(({ title }) => title),
    )

    expect(frozenTitles).toEqual(
      expect.arrayContaining([
        'Tool ≠ Skill',
        'Capability ≠ Tool Execution',
        'Context ≠ Memory',
      ]),
    )
  })

  it('rejects a course claim bound to a project fragment', () => {
    const invalid = structuredClone(authoringContent)
    const h02 = invalid.knowledgeCards.find(({ nodeId }) => nodeId === 'node:h02-context')
    if (h02 === undefined) throw new Error('Missing H02 fixture')
    h02.claims[0]!.sourceFragmentIds = ['fragment:project-agent-context']

    expect(() => validateKnowledgeSystem(invalid, sourceIndex)).toThrow(
      'source layer does not match',
    )
  })
})
