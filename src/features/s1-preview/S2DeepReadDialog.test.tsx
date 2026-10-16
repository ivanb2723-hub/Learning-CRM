import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { content } from '../../domain/content/content.ts'
import { createH02Text } from './h02Edits.ts'
import { S2DeepReadDialog } from './S2DeepReadDialog.tsx'

const card = content.knowledgeCards.find(({ id }) => id === 'card:h02-context')!

describe('H02 S2+ deep reading', () => {
  it('keeps the close icon visible at narrow viewports for experimental readers', () => {
    const css = readFileSync(new URL('./s2-deep-read.css', import.meta.url), 'utf8')
    expect(css).not.toContain('.s2-deep-actions > button:first-child { display: none; }')
    expect(css).toContain('.s2-deep-actions > button:not(.s2-deep-icon) { display: none; }')
  })

  it('opens as a master-detail reader with only the definition section visible', () => {
    const html = renderToStaticMarkup(createElement(S2DeepReadDialog, {
      card, text: createH02Text(card), onClose: () => undefined, onSave: () => null, onExport: () => undefined,
    }))
    const labels = ['一句话定义', 'Why', '原理 → 项目落地', '关键边界', 'Case', 'Interview Lens', 'Evidence']
    for (const label of labels) expect(html).toContain(`>${label}<`)
    expect(html.match(/role="tab"/g)).toHaveLength(7)
    expect(html).not.toContain('>核心机制<')
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain(card.definition)
    expect(html).not.toContain(card.caseSummary)
    expect(html).not.toContain(card.evidenceRefs[0]!.sourceFragmentId)
    expect(html).toContain('aria-label="编辑完整正文"')
    expect(html).toContain('导出修改 JSON')
    expect(html).toContain('1 / 7')
    expect(html).toContain('下一节')
  })

  it('renders a generic reader with real P1 text in the existing S2+ shell', () => {
    const reader = {
      objectId: 'MIN-K03', code: 'MIN-K03', title: '模型调用 Context', subtitle: '瞬时模型输入', mode: 'seven-field',
      sections: [
        { id: 'definition', label: '一句话定义', title: 'Context 是什么？', body: '模型在这一次调用实际可见的材料。' },
        { id: 'why', label: 'Why', title: '为什么？', body: '降低遗漏、泄露与成本风险。' },
      ],
    }
    const html = renderToStaticMarkup(createElement(S2DeepReadDialog as never, { reader, onClose: () => undefined } as never))
    expect(html).toContain('MIN-K03')
    expect(html).toContain('模型调用 Context')
    expect(html).toContain('模型在这一次调用实际可见的材料。')
    expect(html).toContain('1 / 2')
  })

  it('renders three short blocks without fabricating seven empty sections', () => {
    const reader = {
      objectId: 'MIN-K05', code: 'MIN-K05', title: 'Checkpoint', subtitle: '持久化记录', mode: 'short',
      sections: [
        { id: 'what', label: '是什么', title: 'Checkpoint 是什么？', body: '保存 State 快照。' },
        { id: 'related', label: '与谁有关', title: '与 State 的关系', body: 'State 经 snapshots 被保存。' },
        { id: 'limits', label: '不能推断', title: '证据边界', body: '有快照不等于任意故障都恢复成功。' },
      ],
    }
    const html = renderToStaticMarkup(createElement(S2DeepReadDialog as never, { reader, onClose: () => undefined } as never))
    expect(html).toContain('不能推断')
    expect(html).toContain('1 / 3')
    expect(html).not.toContain('Interview Lens')
  })
})
