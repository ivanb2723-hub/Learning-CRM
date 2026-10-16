import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { S1Preview } from './S1Preview.tsx'

describe('S1 formal handoff', () => {
  it('renders the validated map inside the system workspace with a return control', () => {
    const html = renderToStaticMarkup(createElement(S1Preview, { embedded: true, onBack: () => undefined }))

    expect(html).not.toContain('href="/?view=layered"')
    expect(html).toContain('返回系统分层')
    expect(html).not.toContain('s1-preview__header')
    expect((html.match(/data-node-id=/g) ?? [])).toHaveLength(55)
    expect(html).toContain('data-node-id="H02"')
    expect(html).toContain('aria-label="聚焦 H02 Context Assembly（上下文组装）"')
    expect(html).not.toContain('待视觉验收')
  })
})
