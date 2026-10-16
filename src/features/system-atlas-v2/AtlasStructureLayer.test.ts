/// <reference types="node" />
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { AtlasStructureLayer } from './AtlasStructureLayer.tsx'

vi.mock('@xyflow/react', () => ({
  ViewportPortal: ({ children }: { children: ReactNode }) => children,
}))

describe('S0 shared structure', () => {
  it('uses the locally cleaned baked image for S0 while keeping S0-L on its scaffold', () => {
    const overview = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'overview' }))
    const layered = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'layered' }))
    const atlasCss = readFileSync(new URL('./system-atlas-milestone-a.css', import.meta.url), 'utf8')

    expect(overview).toContain('S0-baked-seam-clean-v5.png')
    expect(layered).not.toContain('S0-baked-seam-clean-v5.png')
    expect(layered).toContain('layer-scaffold-a-registered.png')
    expect(atlasCss).toContain('.milestone-atlas-node--overview.milestone-atlas-node--core .milestone-atlas-node__asset')
  })

  it('uses the baked S0 Core instead of painting the old overview Core node', () => {
    const atlasCss = readFileSync(new URL('./system-atlas-milestone-a.css', import.meta.url), 'utf8')
    expect(atlasCss).toContain('.milestone-atlas-node--overview.milestone-atlas-node--core .milestone-atlas-node__asset')
    expect(atlasCss).toContain('visibility: hidden')
  })

  it('does not duplicate the already baked S0 Core rim', () => {
    const overview = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'overview' }))
    const layered = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'layered' }))

    expect(overview).not.toContain('milestone-atlas-overview-core-rim')
    expect(overview).toContain('milestone-atlas-structure__fabric')
    expect(layered).not.toContain('milestone-atlas-overview-core-rim')
  })

  it('keeps the baked overview intact during the original direct view transition', () => {
    const idle = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'overview' }))
    const layered = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'layered' }))

    expect(idle).toContain('S0-baked-seam-clean-v5.png')
    expect(idle).not.toContain('S0-core-flight.png')
    expect(idle).not.toContain('S0-socket-back.png')
    expect(layered).not.toContain('S0-core-flight.png')
  })

  it('routes S0 governance through the two diagonal inter-domain channels without the two extra markers', () => {
    const overview = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'overview' }))
    const layered = renderToStaticMarkup(createElement(AtlasStructureLayer, { mode: 'layered' }))
    const governanceSvg = (markup: string) => markup.match(/<svg class="milestone-atlas-structure__governance"[^>]*>(.*?)<\/svg>/)?.[1] ?? ''
    const overviewSvg = governanceSvg(overview)
    const layeredSvg = governanceSvg(layered)
    const line = overviewSvg.match(/<path d="M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)"/)

    expect(line, 'S0 should use one straight diagonal governance axis').not.toBeNull()
    const [, x1, y1, x2, y2] = (line ?? []).map(Number)
    expect((y2 - y1) / (x2 - x1)).toBeCloseTo(0.617, 2)
    expect(y1).toBeCloseTo(142, 0)
    expect(y2).toBeCloseTo(760, 0)

    const band = overviewSvg.match(/<polygon points="([\d., ]+)" fill="url\(#governance-band\)"/)
    expect(band).not.toBeNull()
    const corners = (band?.[1] ?? '').split(' ').map((corner) => corner.split(',').map(Number))
    expect(corners).toHaveLength(4)
    expect(Math.abs((corners[0][1] + corners[1][1]) / 2 - y1)).toBeLessThan(8)
    expect(Math.abs((corners[2][1] + corners[3][1]) / 2 - y2)).toBeLessThan(8)
    expect(overview.indexOf('milestone-atlas-structure__governance')).toBeLessThan(
      overview.indexOf('milestone-atlas-structure__fabric'),
    )
    expect(layered.indexOf('milestone-atlas-structure__governance')).toBeGreaterThan(
      layered.indexOf('milestone-atlas-structure__fabric'),
    )

    expect((overviewSvg.match(/<circle /g) ?? [])).toHaveLength(1)
    expect((layeredSvg.match(/<circle /g) ?? [])).toHaveLength(2)
    expect(layeredSvg).toContain('M173 181 C470 341 742 511 1287 799')
  })
})
