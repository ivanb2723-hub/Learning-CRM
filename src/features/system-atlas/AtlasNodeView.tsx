import { Handle, Position, type NodeProps } from '@xyflow/react'

import type { AtlasNode, AtlasNodeData } from './atlasProjection.ts'

type IsoPoint = readonly [number, number]

const ISO_ORIGIN: IsoPoint = [210, 30]
const ISO_X = 0.78
const ISO_Y = 0.38

function projectIso(u: number, v: number, z = 0): IsoPoint {
  return [ISO_ORIGIN[0] + (u - v) * ISO_X, ISO_ORIGIN[1] + (u + v) * ISO_Y - z]
}

function points(...values: IsoPoint[]) {
  return values.map(([x, y]) => `${x},${y}`).join(' ')
}

function IsoBlock({ u, v, width, depth, height, baseZ = 0, className = '' }: {
  u: number
  v: number
  width: number
  depth: number
  height: number
  baseZ?: number
  className?: string
}) {
  const topZ = baseZ + height
  const topNorth = projectIso(u, v, topZ)
  const topEast = projectIso(u + width, v, topZ)
  const topSouth = projectIso(u + width, v + depth, topZ)
  const topWest = projectIso(u, v + depth, topZ)
  const bottomEast = projectIso(u + width, v, baseZ)
  const bottomSouth = projectIso(u + width, v + depth, baseZ)
  const bottomWest = projectIso(u, v + depth, baseZ)

  return (
    <g className={`iso-block ${className}`}>
      <polygon className="iso-block__left" points={points(topWest, topSouth, bottomSouth, bottomWest)} />
      <polygon className="iso-block__right" points={points(topEast, topSouth, bottomSouth, bottomEast)} />
      <polygon className="iso-block__top" points={points(topNorth, topEast, topSouth, topWest)} />
    </g>
  )
}

function IsoRack({ u, v, height = 58 }: { u: number; v: number; height?: number }) {
  const lineStart = projectIso(u + 4, v + 31, height - 13)
  const lineEnd = projectIso(u + 27, v + 31, height - 13)

  return (
    <g className="iso-rack">
      <IsoBlock u={u} v={v} width={32} depth={32} height={height} />
      {[0, 10, 20].map((offset) => (
        <line key={offset} x1={lineStart[0]} x2={lineEnd[0]} y1={lineStart[1] + offset} y2={lineEnd[1] + offset + 11} />
      ))}
    </g>
  )
}

function IsoCylinder({ u, v, radius, height }: { u: number; v: number; radius: number; height: number }) {
  const [x, y] = projectIso(u, v)
  return (
    <g className="iso-cylinder">
      <path d={`M ${x - radius} ${y - height} V ${y} A ${radius} ${radius * 0.42} 0 0 0 ${x + radius} ${y} V ${y - height} Z`} />
      <ellipse cx={x} cy={y - height} rx={radius} ry={radius * 0.42} />
      <path className="iso-cylinder__ring" d={`M ${x - radius} ${y - height * 0.48} A ${radius} ${radius * 0.42} 0 0 0 ${x + radius} ${y - height * 0.48}`} />
    </g>
  )
}

function IsoDeck({ layered }: { layered: boolean }) {
  const footprint = [
    [14, 0], [206, 0], [220, 14], [220, 136],
    [206, 150], [14, 150], [0, 136], [0, 14],
  ] as const
  const innerFootprint = [
    [24, 12], [196, 12], [208, 24], [208, 126],
    [196, 138], [24, 138], [12, 126], [12, 24],
  ] as const
  const topPoints = footprint.map(([u, v]) => projectIso(u, v))
  const inner = innerFootprint.map(([u, v]) => projectIso(u, v, 2))

  return (
    <g className="iso-deck">
      <ellipse className="iso-deck__shadow" cx="238" cy="145" rx="160" ry="42" />
      <g className="iso-deck__walls">
        {topPoints.map((point, index) => {
          const next = topPoints[(index + 1) % topPoints.length]
          const lowerNext: IsoPoint = [next[0], next[1] + 18]
          const lowerPoint: IsoPoint = [point[0], point[1] + 18]
          return <polygon className={`iso-deck__wall iso-deck__wall--${index}`} points={points(point, next, lowerNext, lowerPoint)} key={index} />
        })}
      </g>
      <polygon className="iso-deck__top" points={points(...topPoints)} />
      <polygon className="iso-deck__field" points={points(...inner)} />
      <polyline className="iso-deck__rim" points={`${points(...inner)},${inner[0][0]},${inner[0][1]}`} />
      {layered && (
        <g className="iso-deck__pillars">
          {[projectIso(8, 8), projectIso(212, 8), projectIso(212, 142), projectIso(8, 142)].map(([x, y], index) => (
            <g key={index}>
              <rect x={x - 3} y={y - 58} width="6" height="60" rx="2" />
              <ellipse cx={x} cy={y - 58} rx="3" ry="1.7" />
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

function BusinessRegionVisual() {
  const towerEast = projectIso(127, 47, 94)
  const towerSouth = projectIso(127, 89, 94)
  const towerWest = projectIso(79, 89, 94)
  return (
    <g className="iso-modules iso-modules--business">
      <IsoBlock u={79} v={47} width={48} depth={42} height={94} className="iso-tower iso-tower--hero" />
      <IsoBlock u={28} v={35} width={38} depth={36} height={38} />
      <IsoBlock u={142} v={34} width={43} depth={38} height={46} />
      <IsoBlock u={28} v={98} width={46} depth={36} height={34} />
      <IsoBlock u={139} v={99} width={52} depth={35} height={31} />
      <g className="iso-window-grid">
        {[0.24, 0.42, 0.6, 0.78].map((ratio) => (
          <g key={ratio}>
            <line x1={towerEast[0]} y1={towerEast[1] + 94 * ratio} x2={towerSouth[0]} y2={towerSouth[1] + 94 * ratio} />
            <line x1={towerWest[0]} y1={towerWest[1] + 94 * ratio} x2={towerSouth[0]} y2={towerSouth[1] + 94 * ratio} />
          </g>
        ))}
      </g>
    </g>
  )
}

function CapabilityRegionVisual() {
  return (
    <g className="iso-modules iso-modules--capability">
      <IsoBlock u={77} v={47} width={64} depth={58} height={72} className="iso-capability-hub" />
      <IsoBlock u={23} v={41} width={35} depth={35} height={35} />
      <IsoBlock u={160} v={42} width={34} depth={34} height={48} />
      <IsoBlock u={29} v={108} width={31} depth={30} height={28} />
      <IsoBlock u={157} v={104} width={38} depth={31} height={39} />
      <path className="iso-module-route" d="M126 109 L163 127 L209 105 M163 127 L119 148 M163 127 L213 151" />
      <g className="iso-capability-mark">
        <rect x="194" y="61" width="9" height="9" rx="2" />
        <rect x="208" y="68" width="9" height="9" rx="2" />
        <rect x="194" y="77" width="9" height="9" rx="2" />
        <rect x="208" y="84" width="9" height="9" rx="2" />
      </g>
    </g>
  )
}

function RuntimeRegionVisual() {
  return (
    <g className="iso-modules iso-modules--harness">
      <IsoBlock u={32} v={42} width={47} depth={34} height={34} />
      <IsoBlock u={89} v={38} width={82} depth={38} height={42} className="iso-runtime-engine" />
      <IsoBlock u={43} v={102} width={72} depth={30} height={29} />
      <IsoBlock u={130} v={101} width={58} depth={29} height={33} />
      <path className="iso-module-route" d="M114 90 C142 105 143 122 174 130 S226 137 232 155 M114 90 C95 108 98 129 124 142" />
      {[122, 174, 230].map((cx, index) => <circle className="iso-route-node" cx={cx} cy={index === 0 ? 94 : index === 1 ? 130 : 155} r="4" key={cx} />)}
    </g>
  )
}

function ResourcesRegionVisual() {
  return (
    <g className="iso-modules iso-modules--resources">
      <IsoCylinder u={38} v={60} radius={23} height={62} />
      <IsoCylinder u={45} v={116} radius={20} height={45} />
      <IsoRack u={104} v={39} height={68} />
      <IsoRack u={151} v={48} height={55} />
      <IsoRack u={111} v={103} height={42} />
      <path className="iso-module-route" d="M120 126 L157 143 L209 126 L242 143" />
    </g>
  )
}

function DomainModules({ tone }: { tone: AtlasNodeData['tone'] }) {
  if (tone === 'business') return <BusinessRegionVisual />
  if (tone === 'capability') return <CapabilityRegionVisual />
  if (tone === 'harness') return <RuntimeRegionVisual />
  return <ResourcesRegionVisual />
}

function RegionGeometry({ node }: { node: AtlasNode }) {
  const { data } = node
  return (
    <>
      <div className="atlas-annotation">
        <span className="atlas-annotation__index">L{data.layerIndex}</span>
        <span className="atlas-annotation__line" />
        <span className="atlas-annotation__copy"><strong>{data.labelZh}</strong><small>{data.labelEn}</small></span>
      </div>
      <svg className="iso-region" viewBox="0 0 420 225" aria-hidden="true">
        {data.mode === 'layered' && <IsoDeck layered />}
        <DomainModules tone={data.tone} />
        {data.mode === 'layered' && (
          <g className="iso-layer-core-segment">
            <IsoBlock u={91} v={66} width={43} depth={40} height={57} />
          </g>
        )}
      </svg>
      <span className="atlas-region__descriptor">{data.detailZh}</span>
    </>
  )
}

function CrmAgentCoreVisual() {
  return (
    <svg className="iso-core iso-core--overview" viewBox="0 0 270 255" aria-hidden="true">
      <ellipse className="iso-core__orbit iso-core__orbit--outer" cx="135" cy="171" rx="116" ry="44" />
      <ellipse className="iso-core__orbit iso-core__orbit--inner" cx="135" cy="171" rx="79" ry="29" />
      <g className="crm-core-visual">
        <polygon className="crm-core-visual__base-front" points="41,200 132,248 226,198 226,222 133,274 41,224" />
        <polygon className="crm-core-visual__base-top" points="41,200 132,152 226,198 132,248" />
        <polyline className="crm-core-visual__base-rim" points="57,200 132,161 210,199 132,239 57,200" />

        <polygon className="crm-core-visual__body-left" points="78,111 132,140 132,225 78,196" />
        <polygon className="crm-core-visual__body-right" points="132,140 190,109 190,195 132,225" />
        <polygon className="crm-core-visual__body-top" points="78,111 134,82 190,109 132,140" />

        <polygon className="crm-core-visual__control-left" points="111,86 134,98 134,121 111,109" />
        <polygon className="crm-core-visual__control-right" points="134,98 158,85 158,109 134,121" />
        <polygon className="crm-core-visual__control-top" points="111,86 135,73 158,85 134,98" />

        <path className="crm-core-visual__structure-band" d="M84 164 132 189 184 161" />
        <path className="crm-core-visual__accent-edge" d="M190 109V195L132 225" />
        <text className="crm-core-visual__title" x="132" y="151" textAnchor="middle">
          <tspan x="132">CRM</tspan><tspan x="132" dy="17">Agent</tspan>
        </text>
        <g className="crm-core-visual__ports">
          <circle cx="134" cy="82" r="4.5" />
          <circle cx="205" cy="160" r="4.5" />
          <circle cx="133" cy="214" r="4.5" />
          <circle cx="59" cy="164" r="4.5" />
        </g>
      </g>
    </svg>
  )
}

function SystemCore({ node }: { node: AtlasNode }) {
  const { data } = node
  return (
    <>
      {data.mode === 'overview' ? <CrmAgentCoreVisual /> : <svg className="iso-core" viewBox="0 0 270 255" aria-hidden="true">
        <ellipse className="iso-core__orbit iso-core__orbit--outer" cx="135" cy="178" rx="119" ry="48" />
        <ellipse className="iso-core__orbit iso-core__orbit--inner" cx="135" cy="178" rx="82" ry="32" />
        <g transform="translate(-73 53)">
          <IsoBlock u={39} v={37} width={127} depth={110} height={18} className="iso-core-pedestal" />
          <IsoBlock u={58} v={52} width={90} depth={82} height={94} className="iso-core-tower" />
          <IsoBlock u={91} v={82} width={24} depth={23} height={25} baseZ={94} className="iso-core-beacon" />
        </g>
        <text className="iso-core__title" x="135" y="139" textAnchor="middle"><tspan x="135">CRM</tspan><tspan x="135" dy="18">Agent</tspan></text>
        <g className="iso-core__ports"><circle cx="135" cy="44" r="5" /><circle cx="235" cy="177" r="5" /><circle cx="135" cy="226" r="5" /><circle cx="35" cy="177" r="5" /></g>
      </svg>}
      <div className="atlas-core-label"><strong>{data.labelZh}</strong><small>{data.labelEn}</small><span>{data.action}</span></div>
    </>
  )
}

function GovernancePlane({ node }: { node: AtlasNode }) {
  const { data } = node
  if (data.mode === 'overview') {
    return (
      <>
        <svg className="atlas-governance atlas-governance--overview" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="governance-plane-overview" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5ba5eb" stopOpacity="0" />
              <stop offset="0.18" stopColor="#5ba5eb" stopOpacity="0.1" />
              <stop offset="0.78" stopColor="#5ba5eb" stopOpacity="0.1" />
              <stop offset="1" stopColor="#5ba5eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="15,14 112,0 965,690 865,730" fill="url(#governance-plane-overview)" />
          <path className="atlas-governance__spine" d="M80 38 L290 196 L548 410 L920 704" />
          <circle cx="80" cy="38" r="7" /><circle cx="290" cy="196" r="7" /><circle cx="548" cy="410" r="7" /><circle cx="920" cy="704" r="7" />
        </svg>
        <div className="atlas-governance__label"><strong>{data.labelZh}</strong><small>{data.labelEn}</small><span>{data.detailZh}</span></div>
      </>
    )
  }
  return (
    <>
      <svg className="atlas-governance" viewBox="0 0 820 92" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="governance-plane" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6aa8e8" stopOpacity="0" /><stop offset="0.22" stopColor="#6aa8e8" stopOpacity="0.12" /><stop offset="0.78" stopColor="#6aa8e8" stopOpacity="0.12" /><stop offset="1" stopColor="#6aa8e8" stopOpacity="0" /></linearGradient></defs>
        <polygon points="0,54 421,4 820,37 399,89" fill="url(#governance-plane)" />
        <path className="atlas-governance__spine" d="M68 51 L421 12 L748 40" />
        <circle cx="105" cy="47" r="4" /><circle cx="421" cy="12" r="4" /><circle cx="713" cy="37" r="4" />
      </svg>
      <div className="atlas-governance__label"><strong>{data.labelZh}</strong><small>{data.labelEn}</small><span>{data.detailZh}</span></div>
    </>
  )
}

export function AtlasNodeView({ id, data, selected }: NodeProps<AtlasNode>) {
  const className = ['atlas-node', `atlas-node--${data.tone}`, `atlas-node--${data.mode}`, `atlas-node--${data.visualRole}`, selected ? 'is-selected' : ''].filter(Boolean).join(' ')
  return (
    <div className={className} data-node-id={id}>
      {data.kind === 'domain' && <RegionGeometry node={{ id, data } as AtlasNode} />}
      {data.kind === 'agent' && <SystemCore node={{ id, data } as AtlasNode} />}
      {data.kind === 'overlay' && <GovernancePlane node={{ id, data } as AtlasNode} />}
      <Handle className="atlas-node__handle" type="source" position={Position.Top} />
      <Handle className="atlas-node__handle" type="target" position={Position.Bottom} />
    </div>
  )
}
