import { S1_CANVAS } from './s1Layout.ts'

export type Rect = { x: number; y: number; width: number; height: number }
export type Size = { width: number; height: number }
export type CardSide = 'right' | 'left' | 'top' | 'bottom'
export type CardPlacement = { left: number; top: number; side: CardSide; maxHeight: number }

const GAP = 16
const MARGIN = 12

export function focusZoomTarget(fit: number, current: number, viewportWidth: number): number {
  return Math.min(1.2, Math.max(fit, current, viewportWidth >= 1100 ? 1.1 : 0.9))
}

export function focusScrollTarget(
  node: { x: number; y: number },
  zoom: number,
  viewport: Size,
  gutter = { x: 0, y: 0 },
  targetOverride?: { x: number; y: number },
): { left: number; top: number } {
  const narrow = viewport.width < 700
  const targetX = targetOverride?.x ?? viewport.width * (narrow ? 0.5 : 0.36)
  const targetY = targetOverride?.y ?? viewport.height * (narrow ? 0.22 : 0.5)
  const maxLeft = S1_CANVAS.width * zoom + gutter.x * 2 - viewport.width
  const maxTop = S1_CANVAS.height * zoom + gutter.y * 2 - viewport.height
  return {
    left: Math.max(0, Math.min(maxLeft, gutter.x + node.x * zoom - targetX)),
    top: Math.max(0, Math.min(maxTop, gutter.y + node.y * zoom - targetY)),
  }
}

function overlap(a: Rect, b: Rect): number {
  return Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
    * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
}

export function placeAttachedCard(anchor: Rect, viewport: Rect, obstacles: Rect[], card: Size): CardPlacement {
  const centerX = anchor.x + anchor.width / 2
  const centerY = anchor.y + anchor.height / 2
  const candidates: { side: CardSide; left: number; top: number }[] = [
    { side: 'right', left: anchor.x + anchor.width + GAP, top: centerY - card.height / 2 },
    { side: 'left', left: anchor.x - card.width - GAP, top: centerY - card.height / 2 },
    { side: 'bottom', left: centerX - card.width / 2, top: anchor.y + anchor.height + GAP },
    { side: 'top', left: centerX - card.width / 2, top: anchor.y - card.height - GAP },
  ]
  const leftMin = viewport.x + MARGIN
  const topMin = viewport.y + MARGIN
  const leftMax = Math.max(leftMin, viewport.x + viewport.width - card.width - MARGIN)
  const topMax = Math.max(topMin, viewport.y + viewport.height - card.height - MARGIN)
  const scored = candidates.map((candidate, order) => {
    const left = Math.max(leftMin, Math.min(leftMax, candidate.left))
    const bottomSpace = viewport.y + viewport.height - candidate.top - MARGIN
    const bottomHeight = candidate.side === 'bottom' && viewport.width < 700 ? Math.min(card.height, bottomSpace) : card.height
    const maxHeight = Math.max(0, bottomHeight)
    const top = candidate.side === 'bottom' && viewport.width < 700 && maxHeight >= 180
      ? Math.max(topMin, candidate.top)
      : Math.max(topMin, Math.min(topMax, candidate.top))
    const displaced = Math.abs(left - candidate.left) + Math.abs(top - candidate.top)
    const box = { x: left, y: top, width: card.width, height: maxHeight }
    const collisions = obstacles.reduce((total, obstacle) => total + overlap(box, obstacle), 0)
    const anchorCollision = overlap(box, anchor)
    const narrowPreference = viewport.width < 700 && candidate.side !== 'bottom' ? 1000 : 0
    const tooShort = maxHeight < 180 ? 1_000_000 : 0
    return { side: candidate.side, left, top, maxHeight, score: displaced * 1000 + collisions + anchorCollision * 10 + narrowPreference + tooShort + order }
  })
  const best = scored.reduce((current, candidate) => candidate.score < current.score ? candidate : current)
  return { left: best.left, top: best.top, side: best.side, maxHeight: best.maxHeight }
}
