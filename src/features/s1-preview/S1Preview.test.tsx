import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { S1Preview } from './S1Preview.tsx'

describe('S1 knowledge map workspace', () => {
  it('renders the interactive map without duplicating the application header or footer', () => {
    const markup = renderToStaticMarkup(createElement(S1Preview, { embedded: true, onBack: () => undefined }))
    expect(markup).toContain('S1 全域知识地图可平移缩放画布')
    expect(markup).toContain('返回系统分层')
    expect(markup).not.toContain('s1-preview__header')
    expect(markup).not.toContain('s1-preview__footer')
    expect(markup).toContain('data-node-id="H02"')
    expect((markup.match(/<button[^>]*data-node-id=/g) ?? [])).toHaveLength(55)
    expect(markup).not.toMatch(/<button[^>]*s1-preview__core/)
    expect(markup).not.toMatch(/<button[^>]*s1-preview__hub/)
  })

  it('projects the P1 sample into the real S1 canvas without changing the default inventory', () => {
    const markup = renderToStaticMarkup(createElement(S1Preview as never, { embedded: true, experiment: 'p1', onBack: () => undefined } as never))
    expect(markup).toContain('P1 最小样本 · 14 个对象')
    expect(markup).toContain('data-node-id="MIN-K03"')
    expect(markup).toContain('data-node-id="MIN-K05"')
    expect(markup).toContain('data-node-id="MIN-SYS01"')
    expect(markup).toContain('Case-01 测试入口')
    expect(markup).toContain('data-relation-id="L09"')
    expect(markup).toContain('data-relation-type="part-of"')
    expect(markup).toContain('data-relation-type="applies"')
    expect((markup.match(/<button[^>]*data-node-id=/g) ?? [])).toHaveLength(14)
    expect(markup).not.toContain('data-node-id="H02"')
  })
})
