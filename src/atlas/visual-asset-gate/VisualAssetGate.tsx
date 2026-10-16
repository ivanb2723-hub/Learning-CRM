import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react'
import { VisualAssetNode } from './VisualAssetNode.tsx'
import {
  createGateNodes,
  moveResourcesNode,
  type GateNode,
} from './visualAssetGateModel.ts'
import './visual-asset-gate.css'

const nodeTypes: NodeTypes = {
  visualAsset: VisualAssetNode,
}

type GateControlProps = {
  children: React.ReactNode
  onActivate: () => void
  pressed?: boolean
}

function GateControl({ children, onActivate, pressed }: GateControlProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onActivate}
    >
      {children}
    </button>
  )
}

function GateCanvas() {
  const captureOptions = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const focus = params.get('focus')
    const zoom = Number(params.get('zoom'))

    return {
      capture: params.get('capture') === '1',
      focusId: focus === 'core' ? 'crm-core' : focus === 'resources' ? 'resources' : null,
      moved: params.get('moved') === '1',
      zoom: zoom === 1 || zoom === 2 ? zoom : null,
    }
  }, [])
  const [nodes, setNodes] = useState<GateNode[]>(() => {
    const initial = moveResourcesNode(createGateNodes(), captureOptions.moved)
    return initial.map((node) => ({
      ...node,
      selected: node.id === captureOptions.focusId,
    }))
  })
  const [resourcesMoved, setResourcesMoved] = useState(captureOptions.moved)
  const { fitView, setCenter } = useReactFlow<GateNode>()

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? null,
    [nodes],
  )

  const selectNode: NodeMouseHandler<GateNode> = useCallback((_event, node) => {
    setNodes((current) =>
      current.map((candidate) => ({
        ...candidate,
        selected: candidate.id === node.id,
      })),
    )
  }, [])

  const toggleResourcesPosition = useCallback(() => {
    setResourcesMoved((current) => {
      const next = !current
      setNodes((nodesNow) => moveResourcesNode(nodesNow, next))
      return next
    })
  }, [])

  const showAtZoom = useCallback(
    (zoom: number) => {
      const target = selectedNode ?? nodes[0]
      const width = target.data.kind === 'resources' ? 640 : 500
      const height = target.data.kind === 'resources' ? 335 : 320
      void setCenter(
        target.position.x + width / 2,
        target.position.y + height / 2,
        { zoom, duration: 520 },
      )
    },
    [nodes, selectedNode, setCenter],
  )

  useEffect(() => {
    if (!captureOptions.focusId || !captureOptions.zoom) return

    const target = nodes.find((node) => node.id === captureOptions.focusId)
    if (!target) return

    const width = target.data.kind === 'resources' ? 640 : 500
    const height = target.data.kind === 'resources' ? 335 : 320
    const timer = window.setTimeout(() => {
      void setCenter(
        target.position.x + width / 2,
        target.position.y + height / 2,
        { zoom: captureOptions.zoom ?? 1 },
      )
    }, 120)

    return () => window.clearTimeout(timer)
  }, [captureOptions, nodes, setCenter])

  return (
    <main className={`visual-asset-gate${captureOptions.capture ? ' visual-asset-gate--capture' : ''}`}>
      <header className="visual-asset-gate__header">
        <div>
          <span className="visual-asset-gate__eyebrow">Visual Asset Gate 01</span>
          <h1>Direction C 视觉资产验证</h1>
          <p>预渲染 2.5D 主视觉 · React Flow 交互层 · SVG / DOM 动态辅助层</p>
        </div>
        <div className="visual-asset-gate__status" aria-label="Gate scope">
          <span>CORE</span>
          <i aria-hidden="true" />
          <span>RESOURCES</span>
        </div>
      </header>

      <section className="visual-asset-gate__canvas" aria-label="Visual asset interaction gate">
        <svg className="visual-asset-gate__relation" viewBox="0 0 1440 840" aria-hidden="true">
          <defs>
            <linearGradient id="gate-relation" x1="0" x2="1">
              <stop offset="0" stopColor="#1aa99a" stopOpacity="0.16" />
              <stop offset="0.55" stopColor="#55a7ed" stopOpacity="0.48" />
              <stop offset="1" stopColor="#2f80ed" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <path d="M545 478 C655 478 690 449 782 449" />
          <path className="visual-asset-gate__relation-glow" d="M545 478 C655 478 690 449 782 449" />
        </svg>

        <ReactFlow<GateNode>
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodeClick={selectNode}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.5}
          maxZoom={2.2}
          fitView
          fitViewOptions={{ padding: 0.16, minZoom: 0.65, maxZoom: 1 }}
          panOnDrag
          zoomOnDoubleClick={false}
        />

        <nav
          className="visual-asset-gate__controls nodrag nopan nowheel"
          aria-label="Gate verification controls"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <GateControl onActivate={() => void fitView({ padding: 0.12, duration: 520 })}>
            全景
          </GateControl>
          <GateControl onActivate={() => showAtZoom(1)}>
            100%
          </GateControl>
          <GateControl onActivate={() => showAtZoom(2)}>
            200%
          </GateControl>
          <GateControl onActivate={toggleResourcesPosition} pressed={resourcesMoved}>
            {resourcesMoved ? '恢复位置' : '移动 Resources'}
          </GateControl>
        </nav>

        <aside className="visual-asset-gate__note">
          <strong>{selectedNode?.data.title ?? '选择一个视觉资产'}</strong>
          <span>{selectedNode?.data.term ?? '点击 Core 或 Resources 验证 focus / hit area'}</span>
        </aside>
      </section>
    </main>
  )
}

export function VisualAssetGate() {
  return (
    <ReactFlowProvider>
      <GateCanvas />
    </ReactFlowProvider>
  )
}
