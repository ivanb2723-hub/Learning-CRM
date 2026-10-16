import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

export type CompatibilityNode = Node<
  {
    label: string
    detail: string
  },
  'compatibility'
>

export function CompatibilityNodeView({ data }: NodeProps<CompatibilityNode>) {
  return (
    <div className="compatibility-node">
      <Handle type="target" position={Position.Left} />
      <span className="compatibility-node__label">{data.label}</span>
      <span className="compatibility-node__detail">{data.detail}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
