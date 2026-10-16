import { primaryInventory, type S1DomainId, type S1InventoryNode } from './s1Inventory.ts'

export const S1_CANVAS = { width: 2000, height: 2000 } as const
export const S1_PROTECTED_ZONE = { rx: 230, ry: 230 } as const
export const S1_NODE_SIZE = { width: 120, height: 120 } as const

type Box = { id: string; x: number; y: number; width: number; height: number }
type Hub = Box & { id: S1DomainId }
type PlacedNode = Box & { domainId: S1DomainId; name: string }

const hubGeometry: Record<S1DomainId, { x: number; y: number; direction: number }> = {
  business: { x: 1000, y: 755, direction: -90 },
  harness: { x: 1000, y: 1245, direction: 90 },
  capability: { x: 1245, y: 1000, direction: 0 },
  resources: { x: 755, y: 1000, direction: 180 },
}

const rings = [
  { radius: 380, spread: 15 },
  { radius: 520, spread: 29 },
  { radius: 660, spread: 35 },
  { radius: 800, spread: 40 },
] as const

function angles(count: number, spread: number): number[] {
  if (count === 1) return [0]
  return Array.from({ length: count }, (_, index) => -spread + (2 * spread * index) / (count - 1))
}

export function navigationCurve(from: { x: number; y: number }, to: { x: number; y: number }, center: { x: number; y: number }): string {
  const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
  const radial = { x: midpoint.x - center.x, y: midpoint.y - center.y }
  const length = Math.hypot(radial.x, radial.y) || 1
  const cross = (from.x - center.x) * (to.y - center.y) - (from.y - center.y) * (to.x - center.x)
  const bend = Math.sign(cross) * Math.min(95, Math.hypot(to.x - from.x, to.y - from.y) * 0.2)
  const control = { x: midpoint.x - radial.y / length * bend, y: midpoint.y + radial.x / length * bend }
  return `M ${from.x} ${from.y} Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${to.x} ${to.y}`
}

function capacitiesFor(count: number): number[] {
  if (count >= 7) {
    const middleCount = count - 6
    return [2, Math.floor(middleCount / 2), Math.ceil(middleCount / 2), 4]
  }
  let remaining = count
  return [2, 2, 2, 1].map((limit) => {
    const next = Math.min(limit, remaining)
    remaining -= next
    return next
  })
}

export function buildS1Layout(inventory: readonly S1InventoryNode[] = primaryInventory): { core: Box; hubs: Hub[]; nodes: PlacedNode[] } {
  const core = { id: 'core', x: 1000, y: 1000, width: 140, height: 140 }
  const hubs = (Object.keys(hubGeometry) as S1DomainId[]).map((id) => ({
    id, x: hubGeometry[id].x, y: hubGeometry[id].y, width: 156, height: 156,
  }))
  const nodes = (Object.keys(hubGeometry) as S1DomainId[]).flatMap((domainId) => {
    const items = inventory.filter((item) => item.domainId === domainId)
    const hub = hubGeometry[domainId]
    const capacities = capacitiesFor(items.length)
    let cursor = 0
    return rings.flatMap(({ radius, spread }, ringIndex) => {
      const capacity = capacities[ringIndex]
      const batch = items.slice(cursor, cursor + capacity)
      cursor += batch.length
      return batch.map((item, index) => {
        const angle = (hub.direction + angles(batch.length, spread)[index]) * Math.PI / 180
        return {
          id: item.id, name: item.name, domainId,
          x: Math.round((core.x + radius * Math.cos(angle)) * 100) / 100,
          y: Math.round((core.y + radius * Math.sin(angle)) * 100) / 100,
          ...S1_NODE_SIZE,
        }
      })
    })
  })
  return { core, hubs, nodes }
}
