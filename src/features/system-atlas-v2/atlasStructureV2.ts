import {
  applyRegistrationMatrix,
  getLayerRegistration,
  type LayerDomainKind,
  type LayerRegistration,
  type Point,
  type Quadrilateral,
  type RegistrationMatrix,
} from './atlasRegistration.ts'

export type AtlasStructureVariant = 'current' | 'v2'

export type LayerDeckGeometry = Readonly<{
  domainId: string
  kind: LayerDomainKind
  layer: 'L4' | 'L3' | 'L2' | 'L1'
  center: Point
  width: number
  depth: number
  topQuad: Quadrilateral
  supportEnvelope: Quadrilateral
  thickness: number
  zIndex: number
}>

const V2_MATRICES: Record<LayerDomainKind, RegistrationMatrix> = {
  business: { a: 0.1652, b: 0, c: 0, d: 0.1652, e: 594.1, f: 80 },
  capability: { a: 0.1689, b: 0, c: 0, d: 0.1689, e: 590.7, f: 250 },
  runtime: { a: 0.1689, b: 0, c: 0, d: 0.1689, e: 590.5, f: 420 },
  resources: { a: 0.1689, b: 0, c: 0, d: 0.1689, e: 590.3, f: 590 },
}

function transformQuad(matrix: RegistrationMatrix, quad: Quadrilateral): Quadrilateral {
  return {
    frontLeft: applyRegistrationMatrix(matrix, quad.frontLeft),
    frontRight: applyRegistrationMatrix(matrix, quad.frontRight),
    backRight: applyRegistrationMatrix(matrix, quad.backRight),
    backLeft: applyRegistrationMatrix(matrix, quad.backLeft),
  }
}

const DECK_INPUTS: Record<LayerDomainKind, Omit<LayerDeckGeometry, 'supportEnvelope'>> = {
  business: {
    domainId: 'business-product',
    kind: 'business',
    layer: 'L4',
    center: { x: 720, y: 196.5 },
    width: 250,
    depth: 57,
    topQuad: {
      frontLeft: { x: 595, y: 225 },
      frontRight: { x: 845, y: 225 },
      backRight: { x: 815, y: 168 },
      backLeft: { x: 625, y: 168 },
    },
    thickness: 7,
    zIndex: 1,
  },
  capability: {
    domainId: 'capability',
    kind: 'capability',
    layer: 'L3',
    center: { x: 720, y: 371.5 },
    width: 280,
    depth: 67,
    topQuad: {
      frontLeft: { x: 580, y: 405 },
      frontRight: { x: 860, y: 405 },
      backRight: { x: 830, y: 338 },
      backLeft: { x: 610, y: 338 },
    },
    thickness: 8,
    zIndex: 2,
  },
  runtime: {
    domainId: 'agent-runtime',
    kind: 'runtime',
    layer: 'L2',
    center: { x: 720, y: 543 },
    width: 350,
    depth: 78,
    topQuad: {
      frontLeft: { x: 545, y: 582 },
      frontRight: { x: 895, y: 582 },
      backRight: { x: 857, y: 504 },
      backLeft: { x: 583, y: 504 },
    },
    thickness: 9,
    zIndex: 3,
  },
  resources: {
    domainId: 'resources-infrastructure',
    kind: 'resources',
    layer: 'L1',
    center: { x: 720, y: 716.5 },
    width: 290,
    depth: 77,
    topQuad: {
      frontLeft: { x: 575, y: 755 },
      frontRight: { x: 865, y: 755 },
      backRight: { x: 830, y: 678 },
      backLeft: { x: 610, y: 678 },
    },
    thickness: 9,
    zIndex: 4,
  },
}

const V2_REGISTRATIONS = Object.fromEntries(
  (Object.keys(V2_MATRICES) as LayerDomainKind[]).map((kind) => {
    const current = getLayerRegistration(kind)
    const matrix = V2_MATRICES[kind]
    return [kind, {
      ...current,
      layerSurface: DECK_INPUTS[kind].topQuad,
      targetContactPlane: transformQuad(matrix, current.assetFootprint),
      matrix,
    } satisfies LayerRegistration]
  }),
) as Record<LayerDomainKind, LayerRegistration>

export const A_STRUCTURE_V2_DECKS: readonly LayerDeckGeometry[] = (
  ['business', 'capability', 'runtime', 'resources'] as const
).map((kind) => ({
  ...DECK_INPUTS[kind],
  supportEnvelope: V2_REGISTRATIONS[kind].targetContactPlane,
}))

export const A_STRUCTURE_V2_SPINE = {
  x: 720,
  top: 108,
  bottom: 825,
  width: 12,
} as const

export const A_STRUCTURE_V2_POSITIONS = {
  'business-product': { x: 510, y: 185 },
  capability: { x: 510, y: 360 },
  'agent-runtime': { x: 510, y: 540 },
  'resources-infrastructure': { x: 510, y: 720 },
  'crm-core': { x: 585, y: 790 },
} as const

export const A_STRUCTURE_V2_VIEWPORT = { x: 105, y: -38, zoom: 0.68 } as const

export function getLayerRegistrationV2(kind: LayerDomainKind): LayerRegistration {
  return V2_REGISTRATIONS[kind]
}

export function getLayerDeckGeometry(kind: LayerDomainKind): LayerDeckGeometry {
  const deck = A_STRUCTURE_V2_DECKS.find((candidate) => candidate.kind === kind)
  if (!deck) throw new Error(`Missing A Structure V2 deck for ${kind}`)
  return deck
}
