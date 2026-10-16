import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { content } from '../../domain/content/content.ts'
import { AttachedKnowledgeCard } from './AttachedKnowledgeCard.tsx'

const placement = { left: 100, top: 80, side: 'right' as const, maxHeight: 520 }
const h02 = content.knowledgeCards.find(({ id }) => id === 'card:h02-context')!
const h06 = content.knowledgeCards.find(({ id }) => id === 'card:h06-tool-execution')!

function render(card: typeof h02 | null, code = 'H02', name = 'Context Assembly（上下文组装）') {
  return renderToStaticMarkup(createElement(AttachedKnowledgeCard, {
    code, name, domainLabel: 'Agent Runtime / Harness', card, learned: false, placement,
    onToggleLearned: () => undefined, onClose: () => undefined,
  }))
}

describe('Attached Knowledge Card first screen', () => {
  it('orders H02 title, preview, mechanism, canonical boundaries, and disabled reading entry', () => {
    const html = render(h02)
    const parts = [
      'H02 · Agent Runtime / Harness', 'Context Assembly', '上下文组装',
      h02.preview!.definition, h02.preview!.mechanism,
      'Context ≠ Memory', 'Context ≠ System Prompt', 'Context ≠ Context Window',
      '继续阅读完整七字段',
    ]
    let previous = -1
    for (const part of parts) {
      const index = html.indexOf(part, previous + 1)
      expect(index).toBeGreaterThan(previous)
      previous = index
    }
    expect(html).toContain('aria-label="标记学习完成"')
    expect(html).toContain('aria-pressed="false"')
    expect(html).toMatch(/disabled=""[^>]*>[^<]*继续阅读完整七字段|disabled=""[^>]*>.*继续阅读完整七字段/)
    expect(html).toContain('即将开放')
    expect(html).not.toContain(h02.definition)
  })

  it('shows only pending content when no formal Card exists', () => {
    const html = render(null, 'H05', 'Agent Loop（Agent 循环）')
    expect(html).toContain('内容待补充')
    expect(html).not.toContain('标记学习完成')
    expect(html).not.toContain('继续阅读完整七字段')
  })

  it('uses unshortened formal fields for a Card without preview', () => {
    const html = render(h06, 'H06', 'Tool & Execution（工具与执行）').replaceAll('&amp;', '&')
    expect(html).toContain(h06.definition)
    expect(html).toContain(h06.mechanism)
  })

  it('enables H02 deep reading and preview editing only when their actions are supplied', () => {
    const html = renderToStaticMarkup(createElement(AttachedKnowledgeCard, {
      code: 'H02', name: 'Context Assembly（上下文组装）', domainLabel: 'Agent Runtime / Harness', card: h02, learned: false, placement,
      onToggleLearned: () => undefined, onClose: () => undefined,
      onOpenDeep: () => undefined, onSavePreview: () => null,
    }))
    expect(html).toContain('aria-label="编辑首屏摘要"')
    expect(html).toContain('aria-label="继续阅读完整七字段"')
    expect(html).not.toContain('即将开放')
    expect(html).not.toMatch(/disabled=""[^>]*>继续阅读完整七字段/)
  })

  it('renders an experimental full preview through the existing attached card', () => {
    const html = renderToStaticMarkup(createElement(AttachedKnowledgeCard as never, {
      code: 'MIN-K03', name: '模型调用 Context', domainLabel: '运行与模型输入', card: null, learned: false, placement,
      experimentalModel: {
        title: '模型调用 Context', subtitle: '瞬时模型输入 / 信息角色', learnable: true,
        preview: { definition: '一次模型调用实际收到的信息。', mechanism: '选择、裁剪、组织 → 模型调用', boundaries: ['Context ≠ State'] },
        deepReadLabel: '进入完整七字段',
      },
      onToggleLearned: () => undefined, onClose: () => undefined, onOpenDeep: () => undefined,
    } as never))
    expect(html).toContain('MIN-K03 · 运行与模型输入')
    expect(html).toContain('一次模型调用实际收到的信息。')
    expect(html).toContain('进入完整七字段')
    expect(html).toContain('标记学习完成')
  })

  it('keeps navigation objects non-learnable and without a deep-reading action', () => {
    const html = renderToStaticMarkup(createElement(AttachedKnowledgeCard as never, {
      code: 'MIN-SYS01', name: 'CRM Agent 学习总览', domainLabel: '导航聚合', card: null, learned: false, placement,
      experimentalModel: {
        title: 'CRM Agent 学习总览', subtitle: 'System Overview', learnable: false,
        preview: { definition: '学习导览。', mechanism: '组织入口，不生成父子关系。', boundaries: ['导航 ≠ 本体'] },
      },
      onToggleLearned: () => undefined, onClose: () => undefined,
    } as never))
    expect(html).toContain('学习导览。')
    expect(html).not.toContain('标记学习完成')
    expect(html).not.toContain('继续阅读完整七字段')
  })
})
