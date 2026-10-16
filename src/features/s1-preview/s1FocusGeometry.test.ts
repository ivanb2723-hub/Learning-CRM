import { describe, expect, it } from 'vitest'
import { focusScrollTarget, focusZoomTarget, placeAttachedCard } from './s1FocusGeometry.ts'

describe('S1 focus geometry', () => {
  it('enlarges a desktop Focus enough to separate the selected node from neighboring rings', () => {
    expect(focusZoomTarget(0.42, 0.42, 1567)).toBe(1.1)
    expect(focusZoomTarget(0.42, 0.42, 500)).toBe(0.9)
  })
  it('reserves room to the right of a focused desktop node', () => {
    expect(focusScrollTarget({ x: 1000, y: 1400 }, 0.8, { width: 1200, height: 800 }, { x: 1200, y: 800 })).toEqual({ left: 1568, top: 1520 })
  })

  it('uses a high centered anchor on narrow viewports for a card below', () => {
    expect(focusScrollTarget({ x: 1000, y: 1400 }, 0.9, { width: 500, height: 700 }, { x: 500, y: 700 })).toEqual({ left: 1150, top: 1806 })
  })

  it('can place canvas-edge nodes at the viewport center without hitting a scroll boundary', () => {
    const viewport = { width: 1200, height: 800 }
    const gutter = { x: viewport.width, y: viewport.height }
    const topLeft = focusScrollTarget({ x: 0, y: 0 }, 1, viewport, gutter, { x: 600, y: 400 })
    const bottomRight = focusScrollTarget({ x: 2000, y: 2000 }, 1, viewport, gutter, { x: 600, y: 400 })

    expect(topLeft).toEqual({ left: 600, top: 400 })
    expect(bottomRight).toEqual({ left: 2600, top: 2400 })
    expect(bottomRight.left).toBeLessThanOrEqual(2000 + viewport.width)
    expect(bottomRight.top).toBeLessThanOrEqual(2000 + viewport.height)
  })

  it('prefers a clear right-side attachment', () => {
    expect(placeAttachedCard({ x: 500, y: 300, width: 100, height: 100 }, { x: 0, y: 0, width: 1200, height: 800 }, [], { width: 400, height: 500 })).toMatchObject({ left: 616, top: 100, side: 'right' })
  })

  it('flips to the left when the right side is blocked or outside the viewport', () => {
    const viewport = { x: 0, y: 0, width: 1200, height: 800 }
    const anchor = { x: 500, y: 300, width: 100, height: 100 }
    const card = { width: 400, height: 500 }
    expect(placeAttachedCard(anchor, viewport, [{ x: 620, y: 100, width: 450, height: 500 }], card).side).toBe('left')
    expect(placeAttachedCard({ ...anchor, x: 1080 }, viewport, [], card).side).toBe('left')
  })

  it('keeps the card inside a narrow viewport and minimizes unavoidable node overlap', () => {
    const placement = placeAttachedCard(
      { x: 195, y: 120, width: 110, height: 110 },
      { x: 0, y: 0, width: 500, height: 700 },
      [{ x: 50, y: 260, width: 100, height: 100 }],
      { width: 420, height: 390 },
    )
    expect(placement.side).toBe('bottom')
    expect(placement.left).toBeGreaterThanOrEqual(12)
    expect(placement.left + 420).toBeLessThanOrEqual(488)
    expect(placement.top).toBeGreaterThanOrEqual(12)
    expect(placement.top + 390).toBeLessThanOrEqual(688)
  })

  it('shortens a bottom-attached card instead of clamping it across the focused node', () => {
    const anchor = { x: 242, y: 101, width: 108, height: 108 }
    const placement = placeAttachedCard(anchor, { x: 0, y: 0, width: 590, height: 702 }, [], { width: 430, height: 512 })
    expect(placement.side).toBe('bottom')
    expect(placement.top).toBeGreaterThanOrEqual(anchor.y + anchor.height + 16)
    expect(placement.top + placement.maxHeight).toBeLessThanOrEqual(690)
  })

  it('keeps a desktop card full-height when side attachment is available', () => {
    const placement = placeAttachedCard(
      { x: 420, y: 280, width: 132, height: 132 },
      { x: 0, y: 0, width: 1262, height: 702 },
      [{ x: 600, y: 200, width: 120, height: 120 }],
      { width: 430, height: 512 },
    )
    expect(placement.side).not.toBe('bottom')
    expect(placement.maxHeight).toBe(512)
  })
})
