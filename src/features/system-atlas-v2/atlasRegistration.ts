export type Point = Readonly<{ x: number; y: number }>

export type Quadrilateral = Readonly<{
  frontLeft: Point
  frontRight: Point
  backRight: Point
  backLeft: Point
}>

export type RegistrationMatrix = Readonly<{
  a: number
  b: 0
  c: 0
  d: number
  e: number
  f: number
}>

export type LayerDomainKind = 'business' | 'capability' | 'runtime' | 'resources'

export type LayerRegistration = Readonly<{
  kind: LayerDomainKind
  layer: 'L4' | 'L3' | 'L2' | 'L1'
  sourceSize: Readonly<{ width: 1536; height: 1024 }>
  /** Four measured contact points on the visual asset, in source-image coordinates. */
  assetFootprint: Quadrilateral
  /** The complete load-bearing shelf plane, in React Flow graph coordinates. */
  layerSurface: Quadrilateral
  /** The measured placement quadrilateral inside the shelf plane. */
  targetContactPlane: Quadrilateral
  /** The interactive silhouette, deliberately excluding transparent PNG padding. */
  interactionHull: readonly Point[]
  matrix: RegistrationMatrix
}>

export const layerDomainKinds: readonly LayerDomainKind[] = [
  'resources',
  'runtime',
  'capability',
  'business',
]

const SOURCE_SIZE = { width: 1536, height: 1024 } as const

function quadCenter(quad: Quadrilateral): Point {
  const points = Object.values(quad)
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}

export function solveUniformRegistration(
  source: Quadrilateral,
  target: Quadrilateral,
): RegistrationMatrix {
  const sourceCenter = quadCenter(source)
  const targetCenter = quadCenter(target)
  const corners = Object.keys(source) as Array<keyof Quadrilateral>
  let numerator = 0
  let denominator = 0

  for (const corner of corners) {
    const sourceDelta = {
      x: source[corner].x - sourceCenter.x,
      y: source[corner].y - sourceCenter.y,
    }
    const targetDelta = {
      x: target[corner].x - targetCenter.x,
      y: target[corner].y - targetCenter.y,
    }
    numerator += sourceDelta.x * targetDelta.x + sourceDelta.y * targetDelta.y
    denominator += sourceDelta.x ** 2 + sourceDelta.y ** 2
  }

  const scale = numerator / denominator
  return {
    a: scale,
    b: 0,
    c: 0,
    d: scale,
    e: targetCenter.x - sourceCenter.x * scale,
    f: targetCenter.y - sourceCenter.y * scale,
  }
}

export function applyRegistrationMatrix(matrix: RegistrationMatrix, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.e,
    y: matrix.d * point.y + matrix.f,
  }
}

const BUSINESS_FOOTPRINT: Quadrilateral = {
  frontLeft: { x: 300, y: 820 },
  frontRight: { x: 1220, y: 820 },
  backRight: { x: 960, y: 590 },
  backLeft: { x: 510, y: 590 },
}

const CAPABILITY_FOOTPRINT: Quadrilateral = {
  frontLeft: { x: 260, y: 820 },
  frontRight: { x: 1240, y: 820 },
  backRight: { x: 1040, y: 570 },
  backLeft: { x: 470, y: 570 },
}

const RUNTIME_FOOTPRINT: Quadrilateral = {
  frontLeft: { x: 230, y: 800 },
  frontRight: { x: 1300, y: 800 },
  backRight: { x: 1100, y: 560 },
  backLeft: { x: 390, y: 560 },
}

const RESOURCES_FOOTPRINT: Quadrilateral = {
  frontLeft: { x: 220, y: 820 },
  frontRight: { x: 1250, y: 820 },
  backRight: { x: 1100, y: 560 },
  backLeft: { x: 360, y: 560 },
}

// Layer surfaces are registered to the 1440 × 940 graph-space render of the
// corrected solid four-shelf scaffold. Contact planes are occupied regions on those same
// surfaces; they are not alpha-bounds or React Flow node boxes.
const REGISTRATION_INPUTS: Record<LayerDomainKind, Omit<LayerRegistration, 'matrix'>> = {
  business: {
    kind: 'business',
    layer: 'L4',
    sourceSize: SOURCE_SIZE,
    assetFootprint: BUSINESS_FOOTPRINT,
    layerSurface: {
      backLeft: { x: 720, y: 88 },
      backRight: { x: 877, y: 183 },
      frontRight: { x: 720, y: 273 },
      frontLeft: { x: 558, y: 183 },
    },
    targetContactPlane: {
      frontLeft: { x: 646.4, y: 230 },
      frontRight: { x: 793.6, y: 230 },
      backRight: { x: 752, y: 193.2 },
      backLeft: { x: 680, y: 193.2 },
    },
    interactionHull: [
      { x: 180, y: 720 }, { x: 230, y: 430 }, { x: 560, y: 350 },
      { x: 620, y: 80 }, { x: 920, y: 70 }, { x: 1000, y: 340 },
      { x: 1280, y: 390 }, { x: 1420, y: 650 }, { x: 1420, y: 760 },
      { x: 1110, y: 860 }, { x: 780, y: 955 }, { x: 430, y: 865 },
    ],
  },
  capability: {
    kind: 'capability',
    layer: 'L3',
    sourceSize: SOURCE_SIZE,
    assetFootprint: CAPABILITY_FOOTPRINT,
    layerSurface: {
      backLeft: { x: 720, y: 237 },
      backRight: { x: 877, y: 315 },
      frontRight: { x: 720, y: 405 },
      frontLeft: { x: 558, y: 315 },
    },
    targetContactPlane: {
      frontLeft: { x: 641.6, y: 375 },
      frontRight: { x: 798.4, y: 375 },
      backRight: { x: 766.4, y: 335 },
      backLeft: { x: 675.2, y: 335 },
    },
    interactionHull: [
      { x: 170, y: 560 }, { x: 350, y: 130 }, { x: 620, y: 80 },
      { x: 850, y: 170 }, { x: 1090, y: 130 }, { x: 1280, y: 420 },
      { x: 1400, y: 620 }, { x: 1260, y: 880 }, { x: 950, y: 930 },
      { x: 620, y: 870 }, { x: 310, y: 860 },
    ],
  },
  runtime: {
    kind: 'runtime',
    layer: 'L2',
    sourceSize: SOURCE_SIZE,
    assetFootprint: RUNTIME_FOOTPRINT,
    layerSurface: {
      backLeft: { x: 720, y: 361 },
      backRight: { x: 877, y: 440 },
      frontRight: { x: 720, y: 537 },
      frontLeft: { x: 558, y: 440 },
    },
    targetContactPlane: {
      frontLeft: { x: 634.4, y: 505 },
      frontRight: { x: 805.6, y: 505 },
      backRight: { x: 773.6, y: 466.6 },
      backLeft: { x: 660, y: 466.6 },
    },
    interactionHull: [
      { x: 90, y: 430 }, { x: 420, y: 250 }, { x: 650, y: 80 },
      { x: 850, y: 80 }, { x: 1060, y: 250 }, { x: 1450, y: 440 },
      { x: 1450, y: 740 }, { x: 1250, y: 850 }, { x: 900, y: 940 },
      { x: 540, y: 880 }, { x: 100, y: 650 },
    ],
  },
  resources: {
    kind: 'resources',
    layer: 'L1',
    sourceSize: SOURCE_SIZE,
    assetFootprint: RESOURCES_FOOTPRINT,
    layerSurface: {
      backLeft: { x: 720, y: 490 },
      backRight: { x: 877, y: 577 },
      frontRight: { x: 720, y: 690 },
      frontLeft: { x: 558, y: 577 },
    },
    targetContactPlane: {
      frontLeft: { x: 637.6, y: 628 },
      frontRight: { x: 802.4, y: 628 },
      backRight: { x: 778.4, y: 586.4 },
      backLeft: { x: 660, y: 586.4 },
    },
    interactionHull: [
      { x: 210, y: 360 }, { x: 420, y: 180 }, { x: 770, y: 60 },
      { x: 1110, y: 250 }, { x: 1290, y: 470 }, { x: 1260, y: 820 },
      { x: 1070, y: 880 }, { x: 820, y: 940 }, { x: 500, y: 880 },
      { x: 220, y: 720 },
    ],
  },
}

const REGISTRATIONS = Object.fromEntries(
  Object.entries(REGISTRATION_INPUTS).map(([kind, input]) => [
    kind,
    {
      ...input,
      matrix: solveUniformRegistration(input.assetFootprint, input.targetContactPlane),
    },
  ]),
) as Record<LayerDomainKind, LayerRegistration>

const LAYER_Z_INDEX: Record<LayerDomainKind, number> = {
  business: 5,
  capability: 6,
  runtime: 7,
  resources: 8,
}

export function getLayerRegistration(kind: LayerDomainKind): LayerRegistration {
  return REGISTRATIONS[kind]
}

export function getLayerZIndex(kind: LayerDomainKind): number {
  return LAYER_Z_INDEX[kind]
}

export function pointsToSvg(points: readonly Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

export function quadToPoints(quad: Quadrilateral): readonly Point[] {
  return [quad.backLeft, quad.backRight, quad.frontRight, quad.frontLeft]
}
