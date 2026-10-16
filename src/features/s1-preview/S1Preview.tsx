import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { content } from '../../domain/content/content.ts'
import { inventoryDomains, overlayInventory, primaryInventory, type S1DomainId } from './s1Inventory.ts'
import { buildS1Layout, navigationCurve, S1_CANVAS, S1_PROTECTED_ZONE } from './s1Layout.ts'
import { anchoredScrollDelta, freePanGeometry, nextAnimatedZoom, nextWheelZoom } from './s1Viewport.ts'
import { AttachedKnowledgeCard } from './AttachedKnowledgeCard.tsx'
import { S2DeepReadDialog } from './S2DeepReadDialog.tsx'
import { createH02Text, exportH02Edits, readH02Edits, validateH02Text, writeH02Edits, type H02Text } from './h02Edits.ts'
import { reduceS2Reading } from './s2ReadingState.ts'
import { resolveS1Card } from './s1CardModel.ts'
import { focusScrollTarget, focusZoomTarget, placeAttachedCard, type CardPlacement, type Rect } from './s1FocusGeometry.ts'
import { reduceS1Focus } from './s1FocusState.ts'
import { readLearned, writeLearned } from './s1LearningState.ts'
import { objectById, p1Case, p1Inventory, p1Relations, readerForObject } from '../p1-integration/p1KnowledgeModel.ts'
import './s1-preview.css'

const canonicalLayout = buildS1Layout()
const h02Card = content.knowledgeCards.find((card) => card.id === 'card:h02-context')!
const colors: Record<S1DomainId, string> = {
  business: '#e5a03b', harness: '#2db9ab', capability: '#9a7bdd', resources: '#55a7d8',
}

function availableStorage(): Storage | undefined {
  try { return window.localStorage } catch { return undefined }
}

function useFitScale(containerRef: React.RefObject<HTMLDivElement | null>, embedded: boolean) {
  const [fit, setFit] = useState(0.4)
  useEffect(() => {
    const resize = () => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth
      const height = containerRef.current?.clientHeight ?? window.innerHeight
      setFit(Math.min(0.84, (width - (embedded ? 40 : 80)) / S1_CANVAS.width, (height - (embedded ? 112 : 205)) / S1_CANVAS.height))
    }
    const observer = new ResizeObserver(resize)
    if (containerRef.current) observer.observe(containerRef.current)
    window.addEventListener('resize', resize)
    resize()
    return () => { observer.disconnect(); window.removeEventListener('resize', resize) }
  }, [containerRef, embedded])
  return fit
}

export function S1Preview({ embedded = false, onBack, experiment }: { embedded?: boolean; onBack?: () => void; experiment?: 'p1' }) {
  const isP1 = experiment === 'p1' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('p1') === '1')
  const activeInventory = isP1 ? p1Inventory : primaryInventory
  const layout = useMemo(() => isP1 ? buildS1Layout(activeInventory) : canonicalLayout, [activeInventory, isP1])
  const rootRef = useRef<HTMLDivElement>(null)
  const fit = useFitScale(rootRef, embedded)
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  const zoom = manualZoom ?? fit
  const [openList, setOpenList] = useState<'primary' | 'overlay' | 'case' | null>(null)
  const [focus, dispatchFocus] = useReducer(reduceS1Focus, { nodeCode: null, cardOpen: false })
  const [deepOpen, dispatchDeep] = useReducer(reduceS2Reading, false)
  const [h02Text, setH02Text] = useState<H02Text>(() => typeof window === 'undefined' ? createH02Text(h02Card) : readH02Edits(availableStorage(), h02Card))
  const [learned, setLearned] = useState<Record<string, boolean>>(() => typeof window === 'undefined' ? {} : readLearned(availableStorage()))
  const [placement, setPlacement] = useState<CardPlacement>({ left: 12, top: 12, side: 'right', maxHeight: 550 })
  const stageRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const panSurfaceRef = useRef<HTMLDivElement>(null)
  const scaledRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const repositionRef = useRef<() => void>(() => undefined)
  const macroViewportRef = useRef<{ zoom: number; manualZoom: number | null; left: number; top: number } | null>(null)
  const scrollGoalRef = useRef<{ type: 'node'; x: number; y: number } | { type: 'position'; left: number; top: number } | null>(null)
  const zoomLabelRef = useRef<HTMLSpanElement>(null)
  const liveZoomRef = useRef(zoom)
  const targetZoomRef = useRef(zoom)
  const zoomPointerRef = useRef({ x: 0, y: 0 })
  const fitTargetRef = useRef(false)
  const zoomFrameRef = useRef<number | null>(null)
  const panRef = useRef<{ id: number; x: number; y: number; scrollLeft: number; scrollTop: number; captured: boolean } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const previousViewportSizeRef = useRef({ width: 0, height: 0 })
  const hubById = useMemo(() => new Map(layout.hubs.map((hub) => [hub.id, hub])), [layout])
  const nodeById = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout])
  const focusNode = layout.nodes.find((node) => node.id === focus.nodeCode)
  const focusInventory = activeInventory.find((node) => node.id === focus.nodeCode)
  const focusP1Object = isP1 && focus.nodeCode ? objectById(focus.nodeCode) : null
  const focusP1Reader = isP1 && focus.nodeCode ? readerForObject(focus.nodeCode) : null
  const focusCard = !isP1 && focus.nodeCode ? resolveS1Card(focus.nodeCode, content) : null
  const closeDeep = useCallback(() => dispatchDeep({ type: 'close' }), [])
  const panGeometry = useMemo(() => freePanGeometry(S1_CANVAS, zoom, viewportSize), [zoom, viewportSize])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () => setViewportSize((current) => {
      const next = { width: viewport.clientWidth, height: viewport.clientHeight }
      return current.width === next.width && current.height === next.height ? current : next
    })
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    update()
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || viewportSize.width === 0 || viewportSize.height === 0) return
    const previous = previousViewportSizeRef.current
    if (previous.width === 0 || previous.height === 0 || (manualZoom === null && !focus.nodeCode && zoomFrameRef.current === null)) {
      viewport.scrollLeft = panGeometry.centeredLeft
      viewport.scrollTop = panGeometry.centeredTop
    } else {
      viewport.scrollLeft += viewportSize.width - previous.width
      viewport.scrollTop += viewportSize.height - previous.height
    }
    previousViewportSizeRef.current = viewportSize
  }, [focus.nodeCode, manualZoom, panGeometry.centeredLeft, panGeometry.centeredTop, viewportSize])

  useLayoutEffect(() => {
    if (zoomFrameRef.current !== null) return
    liveZoomRef.current = zoom
    targetZoomRef.current = zoom
  }, [zoom])

  const paintZoom = useCallback((next: number, pointer: { x: number; y: number }) => {
    const viewport = viewportRef.current
    const panSurface = panSurfaceRef.current
    const scaled = scaledRef.current
    const canvas = canvasRef.current
    if (!viewport || !panSurface || !scaled || !canvas) return
    const before = scaled.getBoundingClientRect()
    const previous = liveZoomRef.current
    const geometry = freePanGeometry(S1_CANVAS, next, { width: viewport.clientWidth, height: viewport.clientHeight })
    panSurface.style.width = `${geometry.surfaceWidth}px`
    panSurface.style.height = `${geometry.surfaceHeight}px`
    scaled.style.left = `${geometry.gutterX}px`
    scaled.style.top = `${geometry.gutterY}px`
    scaled.style.width = `${geometry.canvasWidth}px`
    scaled.style.height = `${geometry.canvasHeight}px`
    canvas.style.zoom = String(next)
    const after = scaled.getBoundingClientRect()
    const delta = anchoredScrollDelta(pointer, { x: before.left, y: before.top }, { x: after.left, y: after.top }, previous, next)
    viewport.scrollLeft += delta.x
    viewport.scrollTop += delta.y
    liveZoomRef.current = next
    if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(next * 100)}%`
    repositionRef.current()
  }, [])

  const animateTo = useCallback((target: number, pointer: { x: number; y: number }, fitTarget = false, scrollGoal: typeof scrollGoalRef.current = null) => {
    targetZoomRef.current = target
    zoomPointerRef.current = pointer
    fitTargetRef.current = fitTarget
    scrollGoalRef.current = scrollGoal
    if (zoomFrameRef.current !== null) return
    const frame = () => {
      const next = nextAnimatedZoom(liveZoomRef.current, targetZoomRef.current)
      paintZoom(next, zoomPointerRef.current)
      const viewport = viewportRef.current
      const goal = scrollGoalRef.current
      let scrolling = false
      if (viewport && goal) {
        const desired = goal.type === 'node'
          ? focusScrollTarget(goal, next, { width: viewport.clientWidth, height: viewport.clientHeight }, { x: viewport.clientWidth, y: viewport.clientHeight })
          : { left: goal.left, top: goal.top }
        const dx = desired.left - viewport.scrollLeft
        const dy = desired.top - viewport.scrollTop
        scrolling = Math.abs(dx) > 0.7 || Math.abs(dy) > 0.7
        viewport.scrollLeft += scrolling ? dx * 0.28 : dx
        viewport.scrollTop += scrolling ? dy * 0.28 : dy
        repositionRef.current()
      }
      if (next !== targetZoomRef.current || scrolling) {
        zoomFrameRef.current = window.requestAnimationFrame(frame)
      } else {
        zoomFrameRef.current = null
        scrollGoalRef.current = null
        setManualZoom(fitTargetRef.current ? null : next)
      }
    }
    zoomFrameRef.current = window.requestAnimationFrame(frame)
  }, [paintZoom])

  const stopAnimatedView = useCallback(() => {
    scrollGoalRef.current = null
    if (zoomFrameRef.current === null) return
    window.cancelAnimationFrame(zoomFrameRef.current)
    zoomFrameRef.current = null
    targetZoomRef.current = liveZoomRef.current
    fitTargetRef.current = false
    setManualZoom(liveZoomRef.current)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const next = nextWheelZoom(targetZoomRef.current, event.deltaY, fit)
      if (next === targetZoomRef.current) return
      animateTo(next, { x: event.clientX, y: event.clientY })
    }
    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [fit, animateTo])

  useEffect(() => () => {
    if (zoomFrameRef.current !== null) window.cancelAnimationFrame(zoomFrameRef.current)
  }, [])

  const updatePlacement = useCallback(() => {
    if (!focus.nodeCode || !focus.cardOpen) return
    const stage = stageRef.current
    const canvas = canvasRef.current
    const anchorElement = canvas?.querySelector<HTMLElement>(`[data-node-id="${focus.nodeCode}"]`)
    if (!stage || !canvas || !anchorElement) return
    const stageRect = stage.getBoundingClientRect()
    const relative = (rect: DOMRect): Rect => ({ x: rect.left - stageRect.left, y: rect.top - stageRect.top, width: rect.width, height: rect.height })
    const anchor = relative(anchorElement.getBoundingClientRect())
    const obstacles = Array.from(canvas.querySelectorAll<HTMLElement>('.s1-preview__node'))
      .filter((element) => element !== anchorElement)
      .map((element) => relative(element.getBoundingClientRect()))
      .filter((rect) => rect.x < stageRect.width && rect.y < stageRect.height && rect.x + rect.width > 0 && rect.y + rect.height > 0)
    const cardElement = cardRef.current
    const measured = cardElement?.getBoundingClientRect()
    const intrinsicHeight = cardElement
      ? Array.from(cardElement.children).reduce((height, child) => height + (child as HTMLElement).scrollHeight, 2)
      : 550
    const card = { width: measured?.width || Math.min(430, stageRect.width - 24), height: intrinsicHeight }
    const next = placeAttachedCard(anchor, { x: 0, y: 0, width: stageRect.width, height: stageRect.height }, obstacles, card)
    setPlacement((current) => current.left === next.left && current.top === next.top && current.side === next.side && current.maxHeight === next.maxHeight ? current : next)
  }, [focus.nodeCode, focus.cardOpen])

  useLayoutEffect(() => {
    repositionRef.current = updatePlacement
    if (!focus.cardOpen) return
    updatePlacement()
    const viewport = viewportRef.current
    const stage = stageRef.current
    const observer = new ResizeObserver(updatePlacement)
    if (stage) observer.observe(stage)
    if (cardRef.current) observer.observe(cardRef.current)
    viewport?.addEventListener('scroll', updatePlacement, { passive: true })
    window.addEventListener('resize', updatePlacement)
    return () => {
      observer.disconnect()
      viewport?.removeEventListener('scroll', updatePlacement)
      window.removeEventListener('resize', updatePlacement)
    }
  }, [focus.cardOpen, updatePlacement])

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if ((event.target as HTMLElement).closest('button')) return
    const viewport = viewportRef.current
    if (!viewport) return
    stopAnimatedView()
    if (focus.cardOpen) dispatchFocus({ type: 'background-press' })
    panRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop, captured: false }
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current
    const viewport = viewportRef.current
    if (!pan || !viewport || pan.id !== event.pointerId) return
    const dx = event.clientX - pan.x
    const dy = event.clientY - pan.y
    if (!pan.captured && Math.hypot(dx, dy) > 4) {
      event.currentTarget.setPointerCapture(event.pointerId)
      pan.captured = true
      setIsPanning(true)
    }
    if (pan.captured) {
      viewport.scrollLeft = pan.scrollLeft - dx
      viewport.scrollTop = pan.scrollTop - dy
    }
  }
  const stopPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current
    if (!pan || pan.id !== event.pointerId) return
    if (pan.captured && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    panRef.current = null
    setIsPanning(false)
  }

  const changeZoom = (delta: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    animateTo(Math.max(fit, Math.min(1.4, targetZoomRef.current + delta)), { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }
  const fitView = () => {
    closeDeep()
    const viewport = viewportRef.current
    const rect = viewport?.getBoundingClientRect()
    if (!viewport || !rect) return
    if (focus.nodeCode) {
      dispatchFocus({ type: 'exit-focus' })
      macroViewportRef.current = null
    }
    animateTo(fit, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, true, {
      type: 'position',
      left: freePanGeometry(S1_CANVAS, fit, { width: viewport.clientWidth, height: viewport.clientHeight }).centeredLeft,
      top: freePanGeometry(S1_CANVAS, fit, { width: viewport.clientWidth, height: viewport.clientHeight }).centeredTop,
    })
  }

  const selectNode = (code: string) => {
    closeDeep()
    const node = layout.nodes.find((candidate) => candidate.id === code)
    const viewport = viewportRef.current
    if (!node || !viewport) return
    if (!focus.nodeCode) {
      macroViewportRef.current = { zoom: liveZoomRef.current, manualZoom, left: viewport.scrollLeft, top: viewport.scrollTop }
    }
    setOpenList(null)
    dispatchFocus({ type: 'select', code })
    const rect = viewport.getBoundingClientRect()
    const targetZoom = focusZoomTarget(fit, liveZoomRef.current, viewport.clientWidth)
    animateTo(targetZoom, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, false, { type: 'node', x: node.x, y: node.y })
  }

  const exitFocus = () => {
    closeDeep()
    dispatchFocus({ type: 'exit-focus' })
    const restore = macroViewportRef.current
    macroViewportRef.current = null
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!restore || !rect) return
    animateTo(restore.zoom, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, restore.manualZoom === null, { type: 'position', left: restore.left, top: restore.top })
  }

  const toggleLearned = () => {
    const nodeId = isP1 ? focusP1Object?.id : focusCard?.nodeId
    if (!nodeId || (isP1 ? !focusP1Reader || focusP1Reader.mode === 'navigation' : !focusCard?.card)) return
    const next = { ...learned }
    if (next[nodeId]) delete next[nodeId]
    else next[nodeId] = true
    setLearned(next)
    writeLearned(availableStorage(), next)
  }

  const saveH02Preview = (preview: H02Text['preview']): string | null => {
    const next = { ...h02Text, preview }
    const error = validateH02Text(next, h02Card)
    if (error) return error
    if (!writeH02Edits(availableStorage(), next, h02Card)) return '保存失败：当前浏览器不允许本地存储。请检查隐私设置。'
    setH02Text(next)
    return null
  }
  const saveH02Body = (next: H02Text): string | null => {
    const error = validateH02Text(next, h02Card)
    if (error) return error
    if (!writeH02Edits(availableStorage(), next, h02Card)) return '保存失败：当前浏览器不允许本地存储。请检查隐私设置。'
    setH02Text(next)
    return null
  }
  const exportH02 = () => {
    const json = exportH02Edits(availableStorage(), h02Card)
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'H02-Context-Assembly-edits.json'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return <div className={`s1-preview${embedded ? ' s1-preview--embedded' : ''}${focus.nodeCode ? ' is-focused' : ''}`} ref={rootRef}>
    {!embedded && <header className="s1-preview__header">
      <div className="s1-preview__brand"><span className="s1-preview__mark">CRM</span><div><strong>CRM Agent System Explorer</strong><small>个人 CRM Agent 学习系统</small></div></div>
      <div className="s1-preview__title"><span>S1</span><strong>全域知识地图</strong><small>System Knowledge Map · 布局原型</small></div>
      <span className="s1-preview__phase">PHASE 1 · 待视觉验收</span>
    </header>}
    <div className="s1-preview__toolbar">
      <div><strong>{isP1 ? 'P1 最小样本 · 14 个对象' : '四域 · 55 个 Canonical Node'}</strong><span>{isP1 ? '隔离集成验证 · F1/F2 是导航分面，不生成父子关系' : '中心留白 / 外向展开 / 导航关系，不代表技术调用方向'}</span></div>
      <div className="s1-preview__actions">
        {embedded && <button type="button" className="s1-preview__back" onClick={onBack}>← 返回系统分层</button>}
        {focus.nodeCode && <button type="button" className="s1-preview__exit-focus" onClick={exitFocus}>退出聚焦 · 返回全图</button>}
        {isP1 ? <>
          <a href="/?p1Path=1">客户分析学习路径</a>
          <button type="button" onClick={() => setOpenList((value) => value === 'primary' ? null : 'primary')} aria-expanded={openList === 'primary'}>P1 对象 <span>14</span></button>
          <button type="button" onClick={() => setOpenList((value) => value === 'case' ? null : 'case')} aria-expanded={openList === 'case'}>Case-01 测试入口</button>
        </> : <>
          <button type="button" onClick={() => setOpenList((value) => value === 'primary' ? null : 'primary')} aria-expanded={openList === 'primary'}>全量索引 <span>55</span></button>
          <button type="button" onClick={() => setOpenList((value) => value === 'overlay' ? null : 'overlay')} aria-expanded={openList === 'overlay'}>治理与评估 <span>19</span></button>
        </>}
        <button type="button" onClick={() => changeZoom(-0.15)} aria-label="缩小">−</button>
        <span className="s1-preview__zoom" ref={zoomLabelRef}>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => changeZoom(0.15)} aria-label="放大">＋</button>
        <button type="button" onClick={fitView}>全图</button>
      </div>
    </div>
    <div className="s1-preview__stage" ref={stageRef}>
    <div className={`s1-preview__viewport${isPanning ? ' is-panning' : ''}`} ref={viewportRef} aria-label="S1 全域知识地图可平移缩放画布" onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} onPointerLeave={(event) => { if (panRef.current && !panRef.current.captured) stopPan(event) }}>
      <div className="s1-preview__pan-surface" ref={panSurfaceRef} style={{ width: panGeometry.surfaceWidth, height: panGeometry.surfaceHeight }}>
      <div className="s1-preview__scaled" ref={scaledRef} style={{ left: panGeometry.gutterX, top: panGeometry.gutterY, width: panGeometry.canvasWidth, height: panGeometry.canvasHeight }}>
        <div className="s1-preview__canvas" ref={canvasRef} style={{ width: S1_CANVAS.width, height: S1_CANVAS.height, zoom }}>
          <svg className="s1-preview__edges" width={S1_CANVAS.width} height={S1_CANVAS.height} viewBox={`0 0 ${S1_CANVAS.width} ${S1_CANVAS.height}`} aria-hidden="true">
            <ellipse cx={layout.core.x} cy={layout.core.y} rx={S1_PROTECTED_ZONE.rx} ry={S1_PROTECTED_ZONE.ry} className="s1-preview__protected" />
            {layout.hubs.map((hub) => <line key={`core-${hub.id}`} x1={layout.core.x} y1={layout.core.y} x2={hub.x} y2={hub.y} className="s1-preview__core-edge" />)}
            {layout.nodes.map((node) => {
              const hub = hubById.get(node.domainId)!
              return <path key={`nav-${node.id}`} d={navigationCurve(hub, node, layout.core)} className="s1-preview__nav-edge" style={{ stroke: colors[node.domainId] }} />
            })}
            {isP1 && p1Relations.map((relation) => {
              const from = nodeById.get(relation.from)
              const to = nodeById.get(relation.to)
              if (!from || !to) return null
              return <path key={relation.id} d={navigationCurve(from, to, layout.core)} className={`s1-preview__semantic-edge is-${relation.category}`} data-relation-id={relation.id} data-relation-type={relation.type} />
            })}
          </svg>
          <div className="s1-preview__core" style={{ left: layout.core.x, top: layout.core.y }}><span className="s1-preview__core-symbol">✧</span><strong>CRM Agent</strong><small>System Core</small></div>
          {layout.hubs.map((hub) => {
            const domain = inventoryDomains.find(({ id }) => id === hub.id)!
            const count = activeInventory.filter(({ domainId }) => domainId === hub.id).length
            return <div key={hub.id} className={`s1-preview__hub s1-preview__hub--${hub.id}`} style={{ left: hub.x, top: hub.y, '--domain-color': colors[hub.id] } as React.CSSProperties}>
              <span className="s1-preview__hub-count">{count.toString().padStart(2, '0')}</span><strong>{domain.title}</strong><small>{domain.subtitle}</small>
            </div>
          })}
          {layout.nodes.map((node) => <button key={node.id} type="button" className={`s1-preview__node${focus.nodeCode === node.id ? ' is-focused' : ''}`} style={{ left: node.x, top: node.y, '--domain-color': colors[node.domainId] } as React.CSSProperties} title={`${node.id} ${node.name}`} data-node-id={node.id} aria-label={`聚焦 ${node.id} ${node.name}`} aria-pressed={focus.nodeCode === node.id} onClick={() => selectNode(node.id)}>
            <span className="s1-preview__node-dot"/><span className="s1-preview__node-code">{node.id}</span><strong>{node.name}</strong>
          </button>)}
        </div>
      </div>
      </div>
    </div>
    {focusNode && focusInventory && focus.cardOpen && <div className="s1-preview__card-layer">
      <AttachedKnowledgeCard
        code={focusNode.id}
        name={focusInventory.name}
        domainLabel={inventoryDomains.find((domain) => domain.id === focusNode.domainId)?.subtitle ?? ''}
        card={focusCard?.card ?? null}
        learned={Boolean(learned[isP1 ? focusP1Object?.id ?? '' : focusCard?.nodeId ?? ''])}
        placement={placement}
        experimentalModel={focusP1Object ? {
          title: focusP1Object.title,
          subtitle: focusP1Object.subtitle,
          learnable: Boolean(focusP1Reader && focusP1Reader.mode !== 'navigation'),
          preview: focusP1Object.preview,
          deepReadLabel: focusP1Reader?.mode === 'seven-field' ? '进入完整七字段' : focusP1Reader?.mode === 'short' ? '阅读三个短读块' : undefined,
        } : undefined}
        previewText={focus.nodeCode === 'H02' && focusCard?.card?.id === h02Card.id ? h02Text.preview : undefined}
        onSavePreview={focus.nodeCode === 'H02' && focusCard?.card?.id === h02Card.id ? saveH02Preview : undefined}
        onOpenDeep={isP1
          ? focusP1Reader && focusP1Reader.mode !== 'navigation' ? () => dispatchDeep({ type: 'open', nodeCode: focus.nodeCode!, cardOpen: focus.cardOpen, eligible: true }) : undefined
          : focus.nodeCode === 'H02' && focusCard?.card?.id === h02Card.id ? () => dispatchDeep({ type: 'open', nodeCode: focus.nodeCode, cardOpen: focus.cardOpen }) : undefined}
        onToggleLearned={toggleLearned}
        onClose={() => dispatchFocus({ type: 'close-card' })}
        cardRef={cardRef}
      />
    </div>}
    </div>
    {!embedded && <footer className="s1-preview__footer"><span>Inventory 0.2 · 四主体域 55 / 55 · 横切层 19 / 19 可达</span><span>点击节点聚焦 · 拖动画布平移 · 滚轮缩放</span></footer>}
    {openList && <aside className="s1-preview__overlay" aria-label={openList === 'case' ? 'Case-01 受控测试入口' : openList === 'primary' ? '知识对象索引' : '治理与评估横切节点清单'}>
      <div className="s1-preview__overlay-head"><div><span>{openList === 'case' ? 'EXPERIMENTAL CASE ENTRY' : isP1 ? 'P1 / MINIMUM SAMPLE' : openList === 'primary' ? 'FOUR DOMAINS / CANONICAL INVENTORY' : '横切层 / CROSS-CUTTING'}</span><h2>{openList === 'case' ? p1Case.title : openList === 'primary' ? '全量节点索引' : '治理与评估'}</h2><p>{openList === 'case' ? '教学走查，不是已复现的真实 Trace。点击知识身份会回到同一个 S1 对象。' : isP1 ? '实验 ID，不是正式 Node Inventory。' : openList === 'primary' ? '四个主体 Domain · 55 个 Node，完整名称与编号均可核查。' : '19 个 Canonical Node；不是第五、第六主体 Domain。'}</p></div><button type="button" onClick={() => setOpenList(null)} aria-label="关闭节点清单">×</button></div>
      {openList === 'case'
        ? p1Case.steps.map((step) => <section key={step.id}><h3>{step.label} · {step.evidenceStatus}</h3><div className="s1-preview__overlay-list">{step.objectIds.map((id) => <button type="button" key={`${step.id}-${id}`} onClick={() => selectNode(id)}><span>{id}</span><strong>{objectById(id)?.title ?? id}</strong></button>)}</div></section>)
        : openList === 'primary'
          ? inventoryDomains.map((domain) => <section key={domain.id}><h3>{domain.title} · {activeInventory.filter((item) => item.domainId === domain.id).length}</h3><div className="s1-preview__overlay-list">{activeInventory.filter((item) => item.domainId === domain.id).map((item) => <div key={item.id}><span>{item.id}</span><strong>{item.name}</strong></div>)}</div></section>)
          : (['governance', 'evaluation'] as const).map((domainId) => <section key={domainId}><h3>{domainId === 'governance' ? 'Governance · 治理' : 'Evaluation · 评估'}</h3><div className="s1-preview__overlay-list">{overlayInventory.filter((item) => item.domainId === domainId).map((item) => <div key={item.id}><span>{item.id}</span><strong>{item.name}</strong></div>)}</div></section>)}
    </aside>}
    {deepOpen && focus.cardOpen && (isP1
      ? focusP1Reader && focusP1Reader.mode !== 'navigation' && <S2DeepReadDialog reader={focusP1Reader} onClose={closeDeep} />
      : focus.nodeCode === 'H02' && <S2DeepReadDialog card={h02Card} text={h02Text} onClose={closeDeep} onSave={saveH02Body} onExport={exportH02} />)}
  </div>
}
