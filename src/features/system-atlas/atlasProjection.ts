import type { Edge, Node } from '@xyflow/react'

export type AtlasMode = 'overview' | 'layered'
export type AtlasNodeKind = 'agent' | 'domain' | 'overlay'
export type AtlasVisualRole = 'core' | 'region' | 'cross-cutting-plane'
export type AtlasModuleShape = 'tower' | 'block' | 'rack' | 'cylinder' | 'console'

export type AtlasNodeData = {
  label: string
  labelZh: string
  labelEn: string
  detailZh: string
  action?: string
  tone: 'agent' | 'business' | 'harness' | 'capability' | 'resources' | 'overlay'
  kind: AtlasNodeKind
  mode: AtlasMode
  layerIndex?: number
  visualRole: AtlasVisualRole
  modules: readonly AtlasModuleShape[]
}

export type AtlasNode = Node<AtlasNodeData, 'atlas'>

const overviewPositions = {
  agent: { x: 569, y: 300 },
  business: { x: 480, y: 124 },
  harness: { x: 467, y: 615 },
  capability: { x: 841, y: 375 },
  resources: { x: 100, y: 385 },
  overlay: { x: 310, y: 100 },
} as const

const layeredPositions = {
  agent: { x: 615, y: 670 },
  business: { x: 430, y: 35 },
  capability: { x: 442, y: 190 },
  harness: { x: 454, y: 345 },
  resources: { x: 466, y: 500 },
  overlay: { x: 270, y: 325 },
} as const

const atlasDefinitions = [
  {
    id: 'atlas:agent',
    positionKey: 'agent',
    labelZh: 'CRM Agent',
    labelEn: 'System Core',
    detailZh: '一个完整的智能体系统',
    tone: 'agent',
    kind: 'agent',
    visualRole: 'core',
    modules: [],
  },
  {
    id: 'atlas:business',
    positionKey: 'business',
    labelZh: '业务与产品',
    labelEn: 'Business & Product',
    detailZh: '需求 · 行为 · 结果',
    tone: 'business',
    kind: 'domain',
    layerIndex: 4,
    visualRole: 'region',
    modules: ['tower', 'block', 'tower', 'console', 'block'],
  },
  {
    id: 'atlas:harness',
    positionKey: 'harness',
    labelZh: '智能体运行机制',
    labelEn: 'Agent Runtime / Harness',
    detailZh: '上下文 · 循环 · 执行',
    tone: 'harness',
    kind: 'domain',
    layerIndex: 2,
    visualRole: 'region',
    modules: ['console', 'block', 'console', 'tower', 'block'],
  },
  {
    id: 'atlas:capability',
    positionKey: 'capability',
    labelZh: '能力',
    labelEn: 'Capability',
    detailZh: '技能 · 工具 · RAG',
    tone: 'capability',
    kind: 'domain',
    layerIndex: 3,
    visualRole: 'region',
    modules: ['block', 'tower', 'console', 'block', 'tower'],
  },
  {
    id: 'atlas:resources',
    positionKey: 'resources',
    labelZh: '资源与基础设施',
    labelEn: 'Resources & Infrastructure',
    detailZh: '模型 · 存储 · MCP',
    tone: 'resources',
    kind: 'domain',
    layerIndex: 1,
    visualRole: 'region',
    modules: ['cylinder', 'rack', 'rack', 'block', 'rack'],
  },
  {
    id: 'atlas:overlay',
    positionKey: 'overlay',
    labelZh: '治理与评估',
    labelEn: 'Governance / Evaluation',
    detailZh: '横切整个系统的知识层',
    tone: 'overlay',
    kind: 'overlay',
    visualRole: 'cross-cutting-plane',
    modules: [],
  },
] as const

export function projectAtlas(mode: AtlasMode): AtlasNode[] {
  const positions = mode === 'overview' ? overviewPositions : layeredPositions

  return atlasDefinitions.map((definition) => ({
    id: definition.id,
    type: 'atlas',
    position: positions[definition.positionKey],
    data: {
      label: definition.labelEn,
      labelZh: definition.labelZh,
      labelEn: definition.labelEn,
      detailZh:
        definition.kind === 'agent' && mode === 'layered'
          ? '同一个系统，已拆解为四层结构'
          : definition.detailZh,
      action:
        definition.kind === 'agent'
          ? mode === 'overview'
            ? '拆解系统 ↓'
            : '重新聚合 ←'
          : undefined,
      tone: definition.tone,
      kind: definition.kind,
      mode,
      layerIndex: 'layerIndex' in definition ? definition.layerIndex : undefined,
      visualRole: definition.visualRole,
      modules: definition.modules,
    },
    draggable: false,
    connectable: false,
    selectable: definition.kind === 'agent',
    focusable: definition.kind === 'agent',
    zIndex: definition.kind === 'overlay' ? -1 : definition.kind === 'agent' ? 2 : 1,
  }))
}

export const atlasEdges: Edge[] = ['business', 'harness', 'capability', 'resources'].map(
  (domain) => ({
    id: `atlas:agent-${domain}`,
    source: 'atlas:agent',
    target: `atlas:${domain}`,
    type: 'straight',
    selectable: false,
    focusable: false,
    style: { stroke: '#8ca9cb', strokeWidth: 0.8, strokeDasharray: '2 12' },
  }),
)

export function getAtlasFitSchedule(_mode: AtlasMode): readonly number[] {
  return [0, 860]
}
