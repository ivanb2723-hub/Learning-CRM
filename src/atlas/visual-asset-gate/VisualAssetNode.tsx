import type { NodeProps } from '@xyflow/react'
import type { GateNode } from './visualAssetGateModel.ts'

export function VisualAssetNode({ data, selected }: NodeProps<GateNode>) {
  return (
    <article
      className={`visual-asset-node visual-asset-node--${data.kind}${selected ? ' is-selected' : ''}`}
      aria-label={`${data.title} ${data.term}`}
    >
      <div className="visual-asset-node__focus-ring" aria-hidden="true" />
      <img
        className="visual-asset-node__image"
        src={data.assetUrl}
        alt=""
        draggable={false}
      />
      <div className="visual-asset-node__anchor" aria-hidden="true" />
      <div className="visual-asset-node__annotation">
        <span className="visual-asset-node__leader" aria-hidden="true" />
        <div>
          <strong>{data.title}</strong>
          <small>{data.term}</small>
        </div>
      </div>
    </article>
  )
}
