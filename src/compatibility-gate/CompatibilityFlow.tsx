import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type NodeTypes,
} from '@xyflow/react'

import {
  CompatibilityNodeView,
  type CompatibilityNode,
} from './CompatibilityNode'

const nodes: CompatibilityNode[] = [
  {
    id: 'compatibility-input',
    type: 'compatibility',
    position: { x: 0, y: 0 },
    data: {
      label: 'Typed static node',
      detail: 'Read-only compatibility input',
    },
  },
  {
    id: 'compatibility-output',
    type: 'compatibility',
    position: { x: 320, y: 140 },
    data: {
      label: 'Static relation target',
      detail: 'No editable graph behavior',
    },
  },
]

const edges: Edge[] = [
  {
    id: 'compatibility-input-to-output',
    source: 'compatibility-input',
    target: 'compatibility-output',
  },
]

const nodeTypes = {
  compatibility: CompatibilityNodeView,
} satisfies NodeTypes

export function CompatibilityFlow() {
  return (
    <div className="compatibility-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        fitView
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
