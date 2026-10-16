import { describe, expect, it } from 'vitest'
import { content } from '../../domain/content/content.ts'
import { cardPreview, resolveS1Card } from './s1CardModel.ts'

describe('S1 canonical Card resolution', () => {
  it('maps H02 to the frozen canonical Card and its short preview', () => {
    const result = resolveS1Card('H02', content)
    expect(result.nodeId).toBe('node:h02-context')
    expect(result.card?.id).toBe('card:h02-context')
    expect(cardPreview(result.card!).definition).toBe('Harness 在模型每轮决策前，将所需的系统规则、历史消息、工具定义、Skill 信息和相关 Memory 组织为当前运行时 Context。')
    expect(cardPreview(result.card!).mechanism).toBe('信息来源 → 选择 / 裁剪 / 排序 / 注入 → Model API')
    expect(cardPreview(result.card!).boundaries).toBe(result.card!.boundaries)
  })

  it('falls back to the formal fields when a Card has no preview', () => {
    const result = resolveS1Card('H06', content)
    expect(result.card?.id).toBe('card:h06-tool-execution')
    expect(cardPreview(result.card!).definition).toBe(result.card!.definition)
    expect(cardPreview(result.card!).mechanism).toBe(result.card!.mechanism)
  })

  it('does not make inventory-only or no-Card nodes learnable', () => {
    expect(resolveS1Card('H05', content)).toEqual({ nodeId: null, card: null })
    expect(resolveS1Card('H01', content)).toEqual({ nodeId: 'node:h01-request-reception', card: null })
    expect(resolveS1Card('CORE', content)).toEqual({ nodeId: null, card: null })
  })
})
