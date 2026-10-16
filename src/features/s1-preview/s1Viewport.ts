type Point = { x: number; y: number }
type Size = { width: number; height: number }

export type FreePanGeometry = {
  gutterX: number
  gutterY: number
  canvasWidth: number
  canvasHeight: number
  surfaceWidth: number
  surfaceHeight: number
  centeredLeft: number
  centeredTop: number
}

export function freePanGeometry(canvas: Size, zoom: number, viewport: Size): FreePanGeometry {
  const gutterX = viewport.width
  const gutterY = viewport.height
  const canvasWidth = canvas.width * zoom
  const canvasHeight = canvas.height * zoom
  return {
    gutterX,
    gutterY,
    canvasWidth,
    canvasHeight,
    surfaceWidth: canvasWidth + gutterX * 2,
    surfaceHeight: canvasHeight + gutterY * 2,
    centeredLeft: gutterX + canvasWidth / 2 - viewport.width / 2,
    centeredTop: gutterY + canvasHeight / 2 - viewport.height / 2,
  }
}

export function nextWheelZoom(current: number, deltaY: number, fit: number): number {
  const boundedDelta = Math.max(-120, Math.min(120, deltaY))
  return Math.max(fit, Math.min(1.4, current * Math.exp(-boundedDelta * 0.0012)))
}

export function nextAnimatedZoom(current: number, target: number): number {
  if (Math.abs(target - current) < 0.002) return target
  return current + (target - current) * 0.24
}

export function anchoredScrollDelta(pointer: Point, before: Point, after: Point, currentZoom: number, nextZoom: number): Point {
  return {
    x: after.x + ((pointer.x - before.x) / currentZoom) * nextZoom - pointer.x,
    y: after.y + ((pointer.y - before.y) / currentZoom) * nextZoom - pointer.y,
  }
}
