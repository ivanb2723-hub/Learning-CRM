import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react'
import { AtlasAssetNode } from './AtlasAssetNode.tsx'
import { AtlasStructureLayer } from './AtlasStructureLayer.tsx'
import { ContentFocus } from '../content-focus/ContentFocus.tsx'
import { S1Preview } from '../s1-preview/S1Preview.tsx'
import { preserveP1Experiment, reduceSurfaceHandoff } from './surfaceHandoff.ts'
import { layerDomainKinds, type LayerDomainKind } from './atlasRegistration.ts'
import type { AtlasStructureVariant } from './atlasStructureV2.ts'
import {
  createAtlasNodes,
  atlasModeForView,
  getAtlasSearch,
  getAtlasViewport,
  nextAtlasMode,
  type AtlasMode,
  type AtlasNode,
} from './atlasViewModel.ts'
import './system-atlas-milestone-a.css'

const nodeTypes: NodeTypes = { atlasAsset: AtlasAssetNode }

function initialMode(): AtlasMode {
  return atlasModeForView(new URLSearchParams(window.location.search).get('view'))
}

function initialStructureVariant(): AtlasStructureVariant {
  return new URLSearchParams(window.location.search).get('aStructure') === 'v2'
    ? 'v2'
    : 'current'
}

export function KnowledgeMapEntry({ mode, onOpen }: { mode: AtlasMode; onOpen?: () => void }) {
  if (mode !== 'layered') return null
  return <button type="button" className="milestone-shell__knowledge-entry" onClick={onOpen}>知识地图 <span aria-hidden="true">↗</span></button>
}

function AtlasCanvas() {
  const structureVariant = initialStructureVariant()
  const [mode, setMode] = useState<AtlasMode>(initialMode)
  const [handoff, dispatchHandoff] = useReducer(reduceSurfaceHandoff, undefined, () => ({
    surface: new URLSearchParams(window.location.search).get('view') === 's1' ? 's1' as const : 'atlas' as const,
    phase: 'idle' as const,
    target: null,
  }))
  const surface = handoff.surface
  const [nodes, setNodes] = useState<AtlasNode[]>(() => createAtlasNodes(initialMode(), structureVariant))
  const [transitioning, setTransitioning] = useState(false)
  const [focus, setFocus] = useState<{ domainId: string; nodeId?: string } | null>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const { setViewport } = useReactFlow<AtlasNode>()
  const query = new URLSearchParams(window.location.search)
  const solidPlaneDiagnostic = query.get('visualDiag') === 'l3-plane'
  const platformGeometryDiagnostic = query.get('visualDiag') === 'l3-platform-geometry'
  const requestedPlaneDebug = query.get('platformDebug') ?? query.get('planeDebug')
  const solidPlaneDebug = requestedPlaneDebug === 'only'
    || requestedPlaneDebug === 'quad'
    || requestedPlaneDebug === 'axis'
    || requestedPlaneDebug === 'geometry'
    || requestedPlaneDebug === 'coverage'
    ? requestedPlaneDebug
    : undefined
  const localPlatform = platformGeometryDiagnostic
    ? 'gate05' as const
    : solidPlaneDiagnostic
      ? 'gate04' as const
      : undefined
  const alignmentDebug = query.get('alignmentDebug') === '1'
  const requestedDebugLayer = query.get('alignmentLayer')
  const alignmentLayer = layerDomainKinds.includes(requestedDebugLayer as LayerDomainKind)
    ? requestedDebugLayer as LayerDomainKind
    : undefined

  const fitCalibratedView = useCallback((targetMode: AtlasMode, duration = 0) => {
    const base = getAtlasViewport(targetMode, structureVariant)
    const workspaceWidth = workspaceRef.current?.clientWidth
    const workspaceHeight = workspaceRef.current?.clientHeight
    const zoom = workspaceWidth && workspaceHeight
      ? targetMode === 'overview'
        ? base.zoom * Math.min(1.35, workspaceWidth / 1000, workspaceHeight / 650)
        : base.zoom * Math.min(1.8, workspaceWidth / 500, workspaceHeight / 530)
      : base.zoom
    const viewport = workspaceWidth && workspaceHeight
      ? {
          ...base,
          zoom,
          x: workspaceWidth / 2 - 720 * zoom,
          y: (workspaceHeight - 790 * zoom) / 2 - 50 * zoom,
        }
      : base
    void setViewport(viewport, { duration })
  }, [setViewport, structureVariant])

  const modeCopy = useMemo(
    () => surface === 's1'
      ? { code: 'S1', title: '全域知识地图', term: 'System Knowledge Map', hint: '四域环抱核心，节点向外围展开' }
      : mode === 'overview'
      ? { code: 'S0', title: '系统总览', term: 'System Overview', hint: '四域围绕核心，建立整体认知' }
      : { code: 'S0-L', title: '系统分层', term: 'Layered View', hint: '同一系统沿结构轴展开' },
    [mode, surface],
  )

  useEffect(() => {
    if (handoff.phase === 'idle') return
    const timer = window.setTimeout(() => {
      if (handoff.phase === 'out') dispatchHandoff({ type: 'switch' })
      else {
        dispatchHandoff({ type: 'finish' })
        setTransitioning(false)
      }
    }, handoff.phase === 'out' ? 260 : 460)
    return () => window.clearTimeout(timer)
  }, [handoff.phase])

  const openKnowledgeMap = useCallback(() => {
    if (transitioning || handoff.phase !== 'idle') return
    window.history.pushState(null, '', `${window.location.pathname}${preserveP1Experiment(window.location.search, '?view=s1')}`)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dispatchHandoff({ type: 'sync', surface: 's1' })
    else {
      setTransitioning(true)
      dispatchHandoff({ type: 'start', target: 's1' })
    }
  }, [handoff.phase, transitioning])

  const returnToLayered = useCallback(() => {
    if (transitioning || handoff.phase !== 'idle') return
    window.history.pushState(null, '', `${window.location.pathname}${preserveP1Experiment(window.location.search, getAtlasSearch('layered', structureVariant))}`)
    setMode('layered')
    setNodes(createAtlasNodes('layered', structureVariant))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dispatchHandoff({ type: 'sync', surface: 'atlas' })
    else {
      setTransitioning(true)
      dispatchHandoff({ type: 'start', target: 'atlas' })
    }
  }, [handoff.phase, structureVariant, transitioning])

  useEffect(() => {
    const syncLocation = () => {
      const view = new URLSearchParams(window.location.search).get('view')
      dispatchHandoff({ type: 'sync', surface: view === 's1' ? 's1' : 'atlas' })
      setTransitioning(false)
      const nextMode = atlasModeForView(view)
      setMode(nextMode)
      setNodes(createAtlasNodes(nextMode, structureVariant))
    }
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
  }, [structureVariant])

  const changeMode = useCallback((next: AtlasMode) => {
    if (next === mode || transitioning) return
    setTransitioning(true)
    setMode(next)
    setNodes(createAtlasNodes(next, structureVariant))
    window.history.replaceState(null, '', `${window.location.pathname}${preserveP1Experiment(window.location.search, getAtlasSearch(next, structureVariant))}`)
    window.setTimeout(() => setTransitioning(false), 760)
  }, [mode, structureVariant, transitioning])

  const handleNodeClick: NodeMouseHandler<AtlasNode> = useCallback((_event, node) => {
    setNodes((current) => current.map((candidate) => ({
      ...candidate,
      selected: candidate.id === node.id,
    })))
    if (node.id === 'crm-core') changeMode(nextAtlasMode(mode))
    if (node.id === 'agent-runtime') setFocus({ domainId: 'domain:harness' })
  }, [changeMode, mode])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitCalibratedView(mode, 720)
    }, 120)
    return () => window.clearTimeout(timer)
  }, [fitCalibratedView, mode])

  useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return
    let previousWidth = workspace.clientWidth
    let previousHeight = workspace.clientHeight
    const observer = new ResizeObserver(() => {
      const nextWidth = workspace.clientWidth
      const nextHeight = workspace.clientHeight
      if (Math.abs(nextWidth - previousWidth) < 1 && Math.abs(nextHeight - previousHeight) < 1) return
      previousWidth = nextWidth
      previousHeight = nextHeight
      fitCalibratedView(mode)
    })
    observer.observe(workspace)
    return () => observer.disconnect()
  }, [fitCalibratedView, mode])

  return (
    <div className={`milestone-atlas milestone-atlas--${mode} milestone-atlas--structure-${structureVariant}${focus ? ' milestone-atlas--content-focus' : ''}${transitioning ? ' is-transitioning' : ''}${handoff.phase !== 'idle' ? ` is-surface-${handoff.phase}` : ''}${alignmentDebug ? ' milestone-atlas--alignment-debug' : ''}${alignmentLayer ? ` milestone-atlas--isolate-${alignmentLayer}` : ''}${solidPlaneDebug === 'only' ? ' milestone-atlas--plane-only' : ''}`}>
      <header className="milestone-shell__header">
        <div className="milestone-shell__brand">
          <span className="milestone-shell__brand-mark">CRM</span>
          <span>
            <strong>CRM Agent System Explorer</strong>
            <small>个人 CRM Agent 学习系统</small>
          </span>
        </div>
        <div className="milestone-shell__mode-summary">
          <span>{modeCopy.code}</span>
          <strong>{modeCopy.title}</strong>
          <small>{modeCopy.term}</small>
        </div>
        <p>{modeCopy.hint}</p>
      </header>

      <aside className="milestone-shell__sidebar">
        <nav aria-label="主要导航">
          <button type="button" className="is-active"><span>01</span>系统探索<small>Explore</small></button>
          <button type="button" disabled><span>02</span>案例追踪<small>Cases</small></button>
          <button type="button" disabled><span>03</span>知识索引<small>Knowledge</small></button>
          <button type="button" disabled><span>04</span>学习笔记<small>Notes</small></button>
        </nav>
        <div className="milestone-shell__sidebar-note">
          <span>ONE SYSTEM</span>
          <strong>FOUR DOMAINS</strong>
          <small>从整体进入局部，再回到整体</small>
        </div>
      </aside>

      <section ref={workspaceRef} className="milestone-shell__workspace" aria-label={`${modeCopy.title} ${modeCopy.term}`}>
        {!focus && surface === 'atlas' && <KnowledgeMapEntry mode={mode} onOpen={openKnowledgeMap} />}
        {!focus && surface === 'atlas' && <div className="milestone-shell__view-switch" aria-label="视图切换">
          <button type="button" className={mode === 'overview' ? 'is-active' : ''} onClick={() => changeMode('overview')}>
            <span>S0</span>系统总览
          </button>
          <button type="button" className={mode === 'layered' ? 'is-active' : ''} onClick={() => changeMode('layered')}>
            <span>S0-L</span>系统分层
          </button>
          <button type="button" onClick={() => fitCalibratedView(mode, 520)}>
            适应画布
          </button>
        </div>}

        <ReactFlow<AtlasNode>
          style={{ display: surface === 's1' ? 'none' : undefined }}
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.5}
          maxZoom={1.65}
          defaultViewport={getAtlasViewport(mode, structureVariant)}
          panOnDrag
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: false }}
        >
          <AtlasStructureLayer
            mode={mode}
            structureVariant={structureVariant}
            debugLayer={alignmentLayer}
            localPlatform={localPlatform}
            localPlatformDebug={solidPlaneDebug}
          />
        </ReactFlow>

        {surface === 's1' && <S1Preview embedded onBack={returnToLayered} />}

        {focus && <ContentFocus
          domainId={focus.domainId}
          nodeId={focus.nodeId}
          onSelectNode={(nodeId) => setFocus({ domainId: focus.domainId, nodeId })}
          onBackToDomain={() => setFocus({ domainId: focus.domainId })}
          onExit={() => setFocus(null)}
        />}

        {!focus && surface === 'atlas' && <div className="milestone-shell__state-note">
          <span>{modeCopy.code}</span>
          <div><strong>{modeCopy.title}</strong><small>{modeCopy.term}</small></div>
          <p>{mode === 'overview' ? '点击中央 CRM Agent，查看系统内部层级。' : '点击右下方 CRM Agent，返回系统总览。'}</p>
        </div>}
      </section>

      <footer className="milestone-shell__footer">
        <span>System Atlas</span><i />
        <strong>{modeCopy.title}</strong><i />
        <small>{surface === 's1' ? '知识导航' : mode === 'overview' ? '整体认知' : '结构理解'}</small>
      </footer>
    </div>
  )
}

export function SystemAtlasMilestoneA() {
  return <ReactFlowProvider><AtlasCanvas /></ReactFlowProvider>
}
