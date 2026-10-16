import { describe, expect, it } from 'vitest'
import { anchoredScrollDelta, freePanGeometry, nextAnimatedZoom, nextWheelZoom } from './s1Viewport.ts'

describe('S1 map viewport interaction', () => {
  it('zooms with the wheel while respecting fitted and maximum scale', () => {
    expect(nextWheelZoom(0.5, -120, 0.2)).toBeGreaterThan(0.5)
    expect(nextWheelZoom(0.5, 120, 0.2)).toBeLessThan(0.5)
    expect(nextWheelZoom(0.2, 120, 0.2)).toBe(0.2)
    expect(nextWheelZoom(1.4, -120, 0.2)).toBe(1.4)
    expect(nextWheelZoom(0.5, -1200, 0.2)).toBeLessThan(0.6)
  })

  it('keeps the canvas point under the pointer fixed across a zoom', () => {
    expect(anchoredScrollDelta({ x: 200, y: 300 }, { x: 100, y: 200 }, { x: 80, y: 150 }, 0.5, 1)).toEqual({ x: 80, y: 50 })
  })

  it('approaches a zoom target in visible intermediate frames instead of jumping', () => {
    expect(nextAnimatedZoom(0.4, 0.8)).toBeCloseTo(0.496)
    expect(nextAnimatedZoom(0.496, 0.8)).toBeGreaterThan(0.496)
    expect(nextAnimatedZoom(0.799, 0.8)).toBe(0.8)
    expect(nextAnimatedZoom(0.8, 0.4)).toBeLessThan(0.8)
  })

  it('adds one viewport of free-pan room on every side of the canvas', () => {
    expect(freePanGeometry(
      { width: 2000, height: 2000 },
      0.8,
      { width: 1200, height: 800 },
    )).toEqual({
      gutterX: 1200,
      gutterY: 800,
      canvasWidth: 1600,
      canvasHeight: 1600,
      surfaceWidth: 4000,
      surfaceHeight: 3200,
      centeredLeft: 1400,
      centeredTop: 1200,
    })
  })
})
