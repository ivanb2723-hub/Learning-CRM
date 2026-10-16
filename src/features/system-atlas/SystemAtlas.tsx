import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useUpdateNodeInternals,
  useReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react'

import { AtlasNodeView } from './AtlasNodeView.tsx'
import { AtlasScene } from './AtlasScene.tsx'
import {
  atlasEdges,
  getAtlasFitSchedule,
  projectAtlas,
  type AtlasMode,
} from './atlasProjection.ts'

const nodeTypes = { atlas: AtlasNodeView } satisfies NodeTypes

function FitAtlas({ mode }: { mode: AtlasMode }) {
  const { fitView, setViewport } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    if (mode === 'overview') {
      let frameId = 0
      const applyReferenceViewport = () => {
        const canvas = document.querySelector<HTMLElement>('.atlas-canvas')
        if (!canvas) return
        const scale = Math.min(canvas.clientWidth / 1487, canvas.clientHeight / 1058)
        const x = (canvas.clientWidth - 1487 * scale) / 2 + 70 * scale
        const y = (canvas.clientHeight - 1058 * scale) / 2
        void setViewport({ x, y, zoom: scale }, { duration: 0 })
      }
      const queueReferenceViewport = () => {
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(applyReferenceViewport)
      }
      queueReferenceViewport()
      window.addEventListener('resize', queueReferenceViewport)
      return () => {
        window.cancelAnimationFrame(frameId)
        window.removeEventListener('resize', queueReferenceViewport)
      }
    }

    const frameIds: number[] = []
    const timerIds = getAtlasFitSchedule(mode).map((delay, index) =>
      window.setTimeout(() => {
        updateNodeInternals([
          'atlas:agent',
          'atlas:business',
          'atlas:harness',
          'atlas:capability',
          'atlas:resources',
          'atlas:overlay',
        ])
        frameIds.push(
          window.requestAnimationFrame(() => {
            frameIds.push(
              window.requestAnimationFrame(() => {
                void fitView({
                  duration: index === 0 ? 720 : 220,
                  padding: 0.08,
                  maxZoom: 1.02,
                })
              }),
            )
          }),
        )
      }, delay),
    )

    return () => {
      timerIds.forEach(window.clearTimeout)
      frameIds.forEach(window.cancelAnimationFrame)
    }
  }, [fitView, mode, setViewport, updateNodeInternals])

  return null
}

export function SystemAtlas() {
  const [mode, setMode] = useState<AtlasMode>('overview')
  const nodes = useMemo(() => projectAtlas(mode), [mode])

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    if (node.id === 'atlas:agent') {
      setMode((current) => (current === 'overview' ? 'layered' : 'overview'))
    }
  }

  return (
    <section
      className={`system-atlas system-atlas--${mode}`}
      aria-label="CRM Agent System Atlas"
      onKeyDown={(event) => {
        const target = event.target
        if (
          (event.key === 'Enter' || event.key === ' ') &&
          target instanceof Element &&
          target.closest('.atlas-node--agent') !== null
        ) {
          event.preventDefault()
          setMode((current) => (current === 'overview' ? 'layered' : 'overview'))
        }
      }}
    >
      <header className="atlas-header">
        <div>
          <h1>CRM Agent System Explorer</h1>
          <p className="atlas-header__mode">
            <strong>{mode === 'overview' ? '系统总览' : '分层视图'}</strong>
            <span>{mode === 'overview' ? 'S0 / B · System Overview' : 'A · Layered View'}</span>
          </p>
        </div>
        <p className="atlas-header__instruction">
          {mode === 'overview'
            ? '四个系统域围绕同一个 CRM Agent。点击中央体，拆解内部层级。'
            : '同一个 CRM Agent 已沿固定视角拆解为四层。点击系统核心重新聚合。'}
        </p>
      </header>

      <div className="atlas-canvas">
        <ReactFlow
          nodes={nodes}
          edges={atlasEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          nodesConnectable={false}
          nodesDraggable={false}
          edgesReconnectable={false}
          elementsSelectable
          deleteKeyCode={null}
          minZoom={0.55}
          maxZoom={1.3}
          panOnDrag
          zoomOnScroll
        >
          <AtlasScene mode={mode} />
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#dce4ee" />
          <Controls showInteractive={false} position="bottom-right" />
          <FitAtlas mode={mode} />
        </ReactFlow>
      </div>

      <footer className="atlas-footer">
        <span>系统图谱 · System Atlas</span>
        <span>滚轮缩放 · 拖动画布 · 只读模型</span>
      </footer>
    </section>
  )
}
