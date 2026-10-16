import type { Node, XYPosition } from '@xyflow/react'
import businessAssetUrl from '../../assets/system-atlas/business-direction-c.webp'
import capabilityAssetUrl from '../../assets/system-atlas/capability-direction-c.webp'
import runtimeAssetUrl from '../../assets/system-atlas/runtime-direction-c.webp'
import coreAssetUrl from '../../assets/visual-asset-gate/core-direction-c.webp'
import resourcesAssetUrl from '../../assets/visual-asset-gate/resources-direction-c.webp'
import {
  getLayerRegistration,
  getLayerZIndex,
  type LayerDomainKind,
  type LayerRegistration,
} from './atlasRegistration.ts'
import {
  A_STRUCTURE_V2_POSITIONS,
  A_STRUCTURE_V2_VIEWPORT,
  getLayerRegistrationV2,
  type AtlasStructureVariant,
} from './atlasStructureV2.ts'

export type AtlasMode = 'overview' | 'layered'

export function atlasModeForView(view: string | null): AtlasMode {
  return view === 'layered' || view === 's1' ? 'layered' : 'overview'
}
export type AtlasNodeKind =
  | 'business'
  | 'resources'
  | 'capability'
  | 'runtime'
  | 'core'

export type VisualOffset = {
  x: number
  y: number
  scale: number
  rotationDeg?: number
}

export type VisualAnchor = {
  visualCenterX: number
  visualCenterY: number
  groundContactX: number
  groundContactY: number
  overview: VisualOffset
  layered: VisualOffset
}

export type AtlasNodeData = {
  kind: AtlasNodeKind
  title: string
  term: string
  description: string
  accent: string
  assetUrl: string
  mode: AtlasMode
  layer?: string
  logicalPosition: XYPosition
  visualAnchor?: VisualAnchor & { offset: VisualOffset }
  registration?: LayerRegistration
}

export type AtlasNode = Node<AtlasNodeData, 'atlasAsset'>

const OVERVIEW_POSITIONS: Record<string, XYPosition> = {
  'business-product': { x: 510, y: 18 },
  'resources-infrastructure': { x: 70, y: 312 },
  capability: { x: 930, y: 322 },
  'agent-runtime': { x: 500, y: 575 },
  'crm-core': { x: 610, y: 350 },
}

const LAYERED_POSITIONS: Record<string, XYPosition> = {
  'business-product': { x: 510, y: 220 },
  capability: { x: 510, y: 375 },
  'agent-runtime': { x: 510, y: 525 },
  'resources-infrastructure': { x: 510, y: 690 },
  'crm-core': { x: 597, y: 680 },
}

// React Flow positions remain logical anchors. The S0 offsets below register the
// visible module silhouettes to the fabric's *inner carrying floors* after the
// image's contain letterbox has been accounted for. A has independent registration.
const VISUAL_ANCHORS: Record<AtlasNodeKind, VisualAnchor> = {
  business: {
    visualCenterX: 0.524,
    visualCenterY: 0.504,
    groundContactX: 0.524,
    groundContactY: 0.932,
    overview: { x: -12, y: 50, scale: 0.8 },
    layered: { x: 15, y: -125, scale: 0.9 },
  },
  resources: {
    visualCenterX: 0.495,
    visualCenterY: 0.48,
    groundContactX: 0.495,
    groundContactY: 0.854,
    overview: { x: 139, y: -49, scale: 0.76 },
    layered: { x: 15, y: -190, scale: 0.92 },
  },
  capability: {
    visualCenterX: 0.516,
    visualCenterY: 0.494,
    groundContactX: 0.516,
    groundContactY: 0.887,
    overview: { x: -137, y: -52, scale: 0.67 },
    layered: { x: 15, y: -128, scale: 0.92 },
  },
  runtime: {
    visualCenterX: 0.507,
    visualCenterY: 0.5,
    groundContactX: 0.507,
    groundContactY: 0.917,
    overview: { x: 3, y: -100, scale: 0.69, rotationDeg: 3 },
    layered: { x: 15, y: -134, scale: 0.92 },
  },
  core: {
    visualCenterX: 0.502,
    visualCenterY: 0.539,
    groundContactX: 0.502,
    groundContactY: 0.864,
    overview: { x: -40, y: -50, scale: 0.85 },
    layered: { x: 0, y: 0, scale: 0.88 },
  },
}

const DOMAIN_DEFINITIONS = [
  {
    id: 'business-product',
    kind: 'business' as const,
    title: '业务与产品',
    term: 'Business & Product',
    description: '用户、流程与价值结果',
    accent: '#f29b38',
    assetUrl: businessAssetUrl,
    layer: 'L4',
  },
  {
    id: 'resources-infrastructure',
    kind: 'resources' as const,
    title: '资源与基础设施',
    term: 'Resources & Infrastructure',
    description: '数据、模型与系统连接',
    accent: '#16a79b',
    assetUrl: resourcesAssetUrl,
    layer: 'L1',
  },
  {
    id: 'capability',
    kind: 'capability' as const,
    title: '能力',
    term: 'Capability',
    description: 'Skills、Tools、RAG 与 Memory',
    accent: '#8068e8',
    assetUrl: capabilityAssetUrl,
    layer: 'L3',
  },
  {
    id: 'agent-runtime',
    kind: 'runtime' as const,
    title: '智能体运行机制',
    term: 'Agent Runtime / Harness',
    description: 'Context、Loop、Orchestration 与 State',
    accent: '#2694e8',
    assetUrl: runtimeAssetUrl,
    layer: 'L2',
  },
]

export function getAtlasNodePositions(
  mode: AtlasMode,
  structureVariant: AtlasStructureVariant = 'current',
): Record<string, XYPosition> {
  if (mode === 'overview') return OVERVIEW_POSITIONS
  return structureVariant === 'v2' ? A_STRUCTURE_V2_POSITIONS : LAYERED_POSITIONS
}

export function getAtlasVisualAnchor(kind: AtlasNodeKind): VisualAnchor {
  return VISUAL_ANCHORS[kind]
}

function visualAnchorFor(kind: AtlasNodeKind, mode: AtlasMode) {
  const anchor = getAtlasVisualAnchor(kind)
  return { ...anchor, offset: anchor[mode] }
}

export function createAtlasNodes(
  mode: AtlasMode,
  structureVariant: AtlasStructureVariant = 'current',
): AtlasNode[] {
  const positions = getAtlasNodePositions(mode, structureVariant)
  const domainNodes: AtlasNode[] = DOMAIN_DEFINITIONS.map((domain) => ({
    id: domain.id,
    type: 'atlasAsset',
    position: positions[domain.id],
    draggable: false,
    selectable: true,
    focusable: true,
    style: {
      width: mode === 'overview' ? 430 : 390,
      height: mode === 'overview' ? 290 : 188,
      zIndex: mode === 'overview' ? 3 : getLayerZIndex(domain.kind as LayerDomainKind),
    },
    data: {
      ...domain,
      mode,
      logicalPosition: positions[domain.id],
      visualAnchor: mode === 'overview' ? visualAnchorFor(domain.kind, mode) : undefined,
      registration: mode === 'layered'
        ? structureVariant === 'v2'
          ? getLayerRegistrationV2(domain.kind as LayerDomainKind)
          : getLayerRegistration(domain.kind as LayerDomainKind)
        : undefined,
    },
  }))

  return [
    ...domainNodes,
    {
      id: 'crm-core',
      type: 'atlasAsset',
      position: positions['crm-core'],
      draggable: false,
      selectable: true,
      focusable: true,
      style: {
        width: mode === 'overview' ? 300 : 245,
        height: mode === 'overview' ? 245 : 190,
        zIndex: 8,
      },
      data: {
        kind: 'core',
        title: 'CRM Agent 核心',
        term: 'Central System Core',
        description: mode === 'overview' ? '点击拆解系统结构' : '点击重新组合系统',
        accent: '#2f80ed',
        assetUrl: coreAssetUrl,
        mode,
        logicalPosition: positions['crm-core'],
        visualAnchor: visualAnchorFor('core', mode),
      },
    },
  ]
}

export function nextAtlasMode(mode: AtlasMode): AtlasMode {
  return mode === 'overview' ? 'layered' : 'overview'
}

export function getAtlasSearch(
  mode: AtlasMode,
  structureVariant: AtlasStructureVariant = 'current',
): string {
  const params = new URLSearchParams()
  if (mode === 'layered') params.set('view', 'layered')
  if (structureVariant === 'v2') params.set('aStructure', 'v2')
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getAtlasViewport(
  mode: AtlasMode,
  structureVariant: AtlasStructureVariant = 'current',
) {
  if (mode === 'overview') return { x: 15.16, y: 3.54, zoom: 0.748 }
  return structureVariant === 'v2'
    ? A_STRUCTURE_V2_VIEWPORT
    : { x: 115, y: -40, zoom: 0.64 }
}
