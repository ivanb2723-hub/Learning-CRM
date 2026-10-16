import type { Node } from '@xyflow/react'
import coreAssetUrl from '../../assets/visual-asset-gate/core-direction-c.webp'
import resourcesAssetUrl from '../../assets/visual-asset-gate/resources-direction-c.webp'

export type GateNodeKind = 'core' | 'resources'

export type GateNodeData = {
  kind: GateNodeKind
  title: string
  term: string
  assetUrl: string
}

export type GateNode = Node<GateNodeData, 'visualAsset'>

const CORE_POSITION = { x: 760, y: 300 }
const RESOURCES_HOME_POSITION = { x: 160, y: 290 }
const RESOURCES_MOVED_POSITION = { x: 275, y: 175 }

export function createGateNodes(): GateNode[] {
  return [
    {
      id: 'crm-core',
      type: 'visualAsset',
      position: CORE_POSITION,
      draggable: false,
      selectable: true,
      data: {
        kind: 'core',
        title: 'CRM Agent 核心',
        term: 'Central System Core',
        assetUrl: coreAssetUrl,
      },
    },
    {
      id: 'resources',
      type: 'visualAsset',
      position: RESOURCES_HOME_POSITION,
      draggable: false,
      selectable: true,
      data: {
        kind: 'resources',
        title: '资源与基础设施',
        term: 'Resources & Infrastructure',
        assetUrl: resourcesAssetUrl,
      },
    },
  ]
}

export function moveResourcesNode(nodes: GateNode[], moved: boolean): GateNode[] {
  return nodes.map((node) =>
    node.id === 'resources'
      ? {
          ...node,
          position: moved ? RESOURCES_MOVED_POSITION : RESOURCES_HOME_POSITION,
        }
      : node,
  )
}
