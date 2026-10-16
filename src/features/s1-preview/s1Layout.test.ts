import { describe, expect, it } from 'vitest'
import { inventoryDomains, overlayInventory, primaryInventory } from './s1Inventory.ts'
import { buildS1Layout, navigationCurve, S1_CANVAS, S1_PROTECTED_ZONE } from './s1Layout.ts'

const layout = buildS1Layout()

describe('S1 deterministic outward map', () => {
  it('covers Inventory 0.2 exactly without making overlays a fifth Domain', () => {
    expect(inventoryDomains).toHaveLength(4)
    expect(primaryInventory).toHaveLength(55)
    expect(overlayInventory).toHaveLength(19)
    expect(new Set([...primaryInventory, ...overlayInventory].map((node) => node.id)).size).toBe(74)
    expect(primaryInventory.some((node) => node.id === 'C13')).toBe(false)
    expect(layout.nodes).toHaveLength(55)
  })

  it('is stable and keeps every node outside its hub and the protected center', () => {
    expect(buildS1Layout()).toEqual(layout)
    for (const item of layout.nodes) {
      const hub = layout.hubs.find(({ id }) => id === item.domainId)!
      const vector = { x: hub.x - layout.core.x, y: hub.y - layout.core.y }
      const length = Math.hypot(vector.x, vector.y)
      const outwardDistance = ((item.x - hub.x) * vector.x + (item.y - hub.y) * vector.y) / length
      const projectedHalfExtent = (Math.abs(vector.x) * item.width + Math.abs(vector.y) * item.height) / (2 * length)
      expect(outwardDistance - projectedHalfExtent).toBeGreaterThan(0)
      const closestX = Math.max(item.x - item.width / 2, Math.min(layout.core.x, item.x + item.width / 2))
      const closestY = Math.max(item.y - item.height / 2, Math.min(layout.core.y, item.y + item.height / 2))
      const normalized = ((closestX - layout.core.x) / S1_PROTECTED_ZONE.rx) ** 2 + ((closestY - layout.core.y) / S1_PROTECTED_ZONE.ry) ** 2
      expect(normalized).toBeGreaterThan(1)
    }
  })

  it('places nearby Domain hubs inside one continuous outer node ring', () => {
    expect(layout.core.width).toBe(layout.core.height)
    for (const hub of layout.hubs) {
      expect(hub.width).toBe(hub.height)
      expect(Math.hypot(hub.x - layout.core.x, hub.y - layout.core.y)).toBeLessThan(300)
    }
    const bearings = layout.nodes.map((node) => {
      expect(node.width).toBe(node.height)
      const radius = Math.hypot(node.x - layout.core.x, node.y - layout.core.y)
      expect(radius).toBeGreaterThanOrEqual(370)
      expect(radius).toBeLessThanOrEqual(810)
      return (Math.atan2(node.y - layout.core.y, node.x - layout.core.x) * 180 / Math.PI + 360) % 360
    }).sort((a, b) => a - b)
    const gaps = bearings.map((angle, index) => (bearings[(index + 1) % bearings.length] - angle + 360) % 360)
    expect(Math.max(...gaps)).toBeLessThan(30)
    expect(layout.nodes.filter((node) => Math.hypot(node.x - layout.core.x, node.y - layout.core.y) > 780)).toHaveLength(16)
  })

  it('lays out a sparse experimental inventory without dropping nodes or producing invalid coordinates', () => {
    const sparse = [
      { id: 'MIN-SYS01', name: 'System Overview', domainId: 'business' as const },
      { id: 'MIN-K03', name: 'Context', domainId: 'harness' as const },
      { id: 'MIN-K05', name: 'Checkpoint', domainId: 'harness' as const },
      { id: 'MIN-K07', name: 'RAG', domainId: 'capability' as const },
      { id: 'MIN-K09', name: 'Knowledge Base', domainId: 'resources' as const },
    ]
    const sparseLayout = buildS1Layout(sparse)
    expect(sparseLayout.nodes.map(({ id }) => id)).toEqual(sparse.map(({ id }) => id))
    expect(sparseLayout.nodes.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
  })

  it('has no overlapping nodes, hubs, or canvas overflow', () => {
    const boxes = [...layout.nodes, ...layout.hubs]
    const overlaps: string[] = []
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]
      expect(a.x - a.width / 2).toBeGreaterThanOrEqual(0)
      expect(a.y - a.height / 2).toBeGreaterThanOrEqual(0)
      expect(a.x + a.width / 2).toBeLessThanOrEqual(S1_CANVAS.width)
      expect(a.y + a.height / 2).toBeLessThanOrEqual(S1_CANVAS.height)
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j]
        const touching = Math.hypot(a.x - b.x, a.y - b.y) < (a.width + b.width) / 2 + 6
        if (touching) overlaps.push(`${a.id}/${b.id}`)
      }
    }
    expect(overlaps).toEqual([])
  })

  it('uses deterministic curved navigation links', () => {
    const hub = layout.hubs.find(({ id }) => id === 'business')!
    const node = layout.nodes.find(({ id }) => id === 'B01')!
    const path = navigationCurve(hub, node, layout.core)
    expect(path).toMatch(/^M .+ Q .+$/)
    expect(navigationCurve(hub, node, layout.core)).toBe(path)
  })
})
