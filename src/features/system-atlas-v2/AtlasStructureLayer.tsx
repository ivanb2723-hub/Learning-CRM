import { ViewportPortal } from '@xyflow/react'
import layeredScaffoldUrl from '../../assets/system-atlas/layer-scaffold-a-registered.png'
import overviewFabricUrl from '../../assets/system-atlas/system-fabric-s0.webp'
import s0BakedUrl from '../../assets/system-atlas/S0-baked-seam-clean-v5.png'
import {
  getLayerRegistration,
  layerDomainKinds,
  pointsToSvg,
  quadToPoints,
  type LayerDomainKind,
} from './atlasRegistration.ts'
import {
  A_STRUCTURE_V2_DECKS,
  A_STRUCTURE_V2_SPINE,
  getLayerRegistrationV2,
  type AtlasStructureVariant,
  type LayerDeckGeometry,
} from './atlasStructureV2.ts'
import type { AtlasMode } from './atlasViewModel.ts'

type AtlasStructureLayerProps = {
  mode: AtlasMode
  structureVariant?: AtlasStructureVariant
  debugLayer?: LayerDomainKind
  localPlatform?: 'gate04' | 'gate05'
  localPlatformDebug?: 'only' | 'quad' | 'axis' | 'geometry' | 'coverage'
}

function shiftedFacePoints(deck: LayerDeckGeometry, side: 'front' | 'left' | 'right'): string {
  const { topQuad, thickness } = deck
  const down = (point: { x: number; y: number }) => ({ x: point.x, y: point.y + thickness })
  if (side === 'front') {
    return pointsToSvg([
      topQuad.frontLeft,
      topQuad.frontRight,
      down(topQuad.frontRight),
      down(topQuad.frontLeft),
    ])
  }
  if (side === 'left') {
    return pointsToSvg([
      topQuad.backLeft,
      topQuad.frontLeft,
      down(topQuad.frontLeft),
      down(topQuad.backLeft),
    ])
  }
  return pointsToSvg([
    topQuad.backRight,
    topQuad.frontRight,
    down(topQuad.frontRight),
    down(topQuad.backRight),
  ])
}

function StructureV2Geometry() {
  return (
    <svg
      className="milestone-atlas-structure__v2"
      viewBox="0 0 1440 940"
      data-structure-version="v2"
    >
      <defs>
        <linearGradient id="a-v2-spine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9d5ee" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#f8fcff" stopOpacity="0.86" />
          <stop offset="1" stopColor="#87b9e8" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="a-v2-deck-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.97" />
          <stop offset="1" stopColor="#e9f2fa" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id="a-v2-deck-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9e7f3" stopOpacity="0.94" />
          <stop offset="1" stopColor="#bfd3e4" stopOpacity="0.88" />
        </linearGradient>
        <filter id="a-v2-deck-shadow" x="-25%" y="-50%" width="150%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
          <feOffset in="blur" dy="7" result="offsetBlur" />
          <feColorMatrix in="offsetBlur" type="matrix" values="0 0 0 0 0.18 0 0 0 0 0.30 0 0 0 0 0.43 0 0 0 0.16 0" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g className="milestone-atlas-structure__v2-rear">
        <path d={`M${A_STRUCTURE_V2_SPINE.x - 31} ${A_STRUCTURE_V2_SPINE.top + 12} L${A_STRUCTURE_V2_SPINE.x - 31} ${A_STRUCTURE_V2_SPINE.bottom - 26}`} />
        <path d={`M${A_STRUCTURE_V2_SPINE.x + 31} ${A_STRUCTURE_V2_SPINE.top + 12} L${A_STRUCTURE_V2_SPINE.x + 31} ${A_STRUCTURE_V2_SPINE.bottom - 26}`} />
        <rect
          x={A_STRUCTURE_V2_SPINE.x - A_STRUCTURE_V2_SPINE.width / 2}
          y={A_STRUCTURE_V2_SPINE.top}
          width={A_STRUCTURE_V2_SPINE.width}
          height={A_STRUCTURE_V2_SPINE.bottom - A_STRUCTURE_V2_SPINE.top}
          rx="6"
        />
        {A_STRUCTURE_V2_DECKS.map((deck) => (
          <g key={`connector-${deck.kind}`}>
            <path d={`M${A_STRUCTURE_V2_SPINE.x - 31} ${deck.topQuad.backLeft.y + 9} H${deck.topQuad.backLeft.x}`} />
            <path d={`M${A_STRUCTURE_V2_SPINE.x + 31} ${deck.topQuad.backRight.y + 9} H${deck.topQuad.backRight.x}`} />
            <circle cx={A_STRUCTURE_V2_SPINE.x} cy={deck.center.y} r="5" />
          </g>
        ))}
      </g>

      <g className="milestone-atlas-structure__v2-decks">
        {A_STRUCTURE_V2_DECKS.map((deck) => (
          <g
            key={deck.kind}
            className={`milestone-atlas-structure__v2-deck is-${deck.kind}`}
            data-deck-kind={deck.kind}
            data-deck-width={deck.width}
            data-deck-depth={deck.depth}
            filter="url(#a-v2-deck-shadow)"
          >
            <polygon className="is-left-face" points={shiftedFacePoints(deck, 'left')} />
            <polygon className="is-right-face" points={shiftedFacePoints(deck, 'right')} />
            <polygon className="is-front-face" points={shiftedFacePoints(deck, 'front')} />
            <polygon className="is-top-face" points={pointsToSvg(quadToPoints(deck.topQuad))} />
          </g>
        ))}
      </g>

      <g className="milestone-atlas-structure__v2-debug">
        <path className="is-spine-axis" d={`M${A_STRUCTURE_V2_SPINE.x} ${A_STRUCTURE_V2_SPINE.top - 18} V${A_STRUCTURE_V2_SPINE.bottom + 18}`} />
        {A_STRUCTURE_V2_DECKS.map((deck, index) => {
          const next = A_STRUCTURE_V2_DECKS[index + 1]
          return (
            <g key={`debug-${deck.kind}`} data-v2-debug-layer={deck.kind}>
              <polygon className="is-deck-quad" points={pointsToSvg(quadToPoints(deck.topQuad))} />
              <polygon className="is-support-envelope" points={pointsToSvg(quadToPoints(deck.supportEnvelope))} />
              <circle className="is-deck-center" cx={deck.center.x} cy={deck.center.y} r="5" />
              <text x={deck.topQuad.frontRight.x + 12} y={deck.center.y}>{deck.layer} {deck.width}×{deck.depth}</text>
              {next && (
                <path className="is-layer-spacing" d={`M${deck.center.x + 74} ${deck.center.y} V${next.center.y}`} />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

const GATE04_CAPABILITY_PLANE = {
  backLeft: { x: 646, y: 317 },
  backRight: { x: 809, y: 317 },
  frontRight: { x: 819, y: 411 },
  frontLeft: { x: 630, y: 411 },
} as const

const L3_SCAFFOLD_INNER_QUAD = {
  backLeft: { x: 720.8, y: 259 },
  backRight: { x: 858, y: 318.4 },
  frontRight: { x: 720.8, y: 377.8 },
  frontLeft: { x: 583.6, y: 318.4 },
} as const

const GATE05_CAPABILITY_PLATFORM = {
  backLeft: { x: 726.5, y: 282 },
  backRight: { x: 913.5, y: 363 },
  frontRight: { x: 726.5, y: 444 },
  frontLeft: { x: 539.5, y: 363 },
} as const

const CAPABILITY_MODULE_COVERAGE = [
  { x: 655, y: 320 },
  { x: 802, y: 320 },
  { x: 802, y: 406 },
  { x: 650, y: 406 },
] as const

export function AtlasStructureLayer({
  mode,
  structureVariant = 'current',
  debugLayer,
  localPlatform,
  localPlatformDebug,
}: AtlasStructureLayerProps) {
  const isStructureV2 = mode === 'layered' && structureVariant === 'v2'
  const capabilityFootprint = getLayerRegistration('capability').targetContactPlane
  const platformQuad = localPlatform === 'gate05'
    ? GATE05_CAPABILITY_PLATFORM
    : GATE04_CAPABILITY_PLANE
  const platformPoints = pointsToSvg(quadToPoints(platformQuad))
  const isGate05 = localPlatform === 'gate05'
  const governanceOverlay = (
    <svg className="milestone-atlas-structure__governance" viewBox="0 0 1440 940">
      <defs>
        <linearGradient id="governance-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4d9ce8" stopOpacity="0" />
          <stop offset="0.22" stopColor="#4d9ce8" stopOpacity="0.1" />
          <stop offset="0.78" stopColor="#4d9ce8" stopOpacity="0.1" />
          <stop offset="1" stopColor="#4d9ce8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={mode === 'overview'
          ? '244,178 272,106 1274,724 1246,796'
          : '132,184 205,142 1324,776 1253,819'}
        fill="url(#governance-band)"
      />
      <path d={mode === 'overview'
        ? 'M 258 142 L 1260 760'
        : 'M173 181 C470 341 742 511 1287 799'} />
      {mode === 'layered' && <circle cx="762" cy="517" r="6" />}
      <circle cx="1125" cy={mode === 'overview' ? '677' : '706'} r="6" />
    </svg>
  )

  return (
    <>
      <ViewportPortal>
        <div className={`milestone-atlas-structure milestone-atlas-structure--${mode}`} aria-hidden="true">
        {mode === 'overview' && governanceOverlay}
        <img
          className="milestone-atlas-structure__fabric"
          src={mode === 'overview' ? s0BakedUrl : overviewFabricUrl}
          alt=""
          draggable={false}
        />
        {isStructureV2 && <StructureV2Geometry />}
        <img
          className="milestone-atlas-structure__scaffold"
          src={layeredScaffoldUrl}
          alt=""
          draggable={false}
        />
        {mode === 'layered' && localPlatform && (
          <svg
            className="milestone-atlas-structure__l3-solid-plane"
            viewBox="0 0 1440 940"
            data-platform-kind={localPlatform}
            data-plane-points={platformPoints}
            data-scaffold-inner-points={pointsToSvg(quadToPoints(L3_SCAFFOLD_INNER_QUAD))}
            data-plane-z-order="2"
          >
            <defs>
              <linearGradient id="l3-solid-plane-top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f9fcff" stopOpacity="0.96" />
                <stop offset="1" stopColor="#eaf3fb" stopOpacity="0.92" />
              </linearGradient>
              <linearGradient id="l3-solid-plane-front" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#dce9f5" stopOpacity="0.94" />
                <stop offset="1" stopColor="#c7d9e9" stopOpacity="0.88" />
              </linearGradient>
              <filter id="l3-solid-plane-shadow" x="-20%" y="-30%" width="140%" height="180%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                <feOffset in="blur" dy="5" result="offsetBlur" />
                <feColorMatrix in="offsetBlur" type="matrix" values="0 0 0 0 0.22 0 0 0 0 0.34 0 0 0 0 0.47 0 0 0 0.18 0" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g className="milestone-atlas-structure__l3-plane-art" filter="url(#l3-solid-plane-shadow)">
              <polygon
                className="is-front-face"
                points={isGate05
                  ? '539.5,363 726.5,444 726.5,451.5 539.5,370.5'
                  : '630,411 819,411 819,418.5 630,418.5'}
              />
              <polygon
                className="is-left-face"
                points={isGate05
                  ? '726.5,282 539.5,363 539.5,370.5 726.5,289.5'
                  : '646,317 630,411 630,418.5 646,324.5'}
              />
              <polygon className="is-top-face" points={platformPoints} />
            </g>
            {localPlatformDebug === 'quad' && (
              <g className="milestone-atlas-structure__l3-plane-debug">
                <polygon className="is-plane-quad" points={platformPoints} />
                <polygon
                  className="is-footprint-quad"
                  points={pointsToSvg(quadToPoints(capabilityFootprint))}
                />
              </g>
            )}
            {isGate05 && localPlatformDebug === 'axis' && (
              <g className="milestone-atlas-structure__l3-axis-debug">
                <polygon points={pointsToSvg(quadToPoints(L3_SCAFFOLD_INNER_QUAD))} />
                <path className="is-axis-a" d="M525 245 L930 420" />
                <path className="is-axis-b" d="M930 245 L525 420" />
                <circle cx="720.8" cy="325" r="5" />
              </g>
            )}
            {isGate05 && localPlatformDebug === 'geometry' && (
              <g className="milestone-atlas-structure__l3-geometry-debug">
                <polygon className="is-inner-quad" points={pointsToSvg(quadToPoints(L3_SCAFFOLD_INNER_QUAD))} />
                <polygon className="is-gate04-quad" points={pointsToSvg(quadToPoints(GATE04_CAPABILITY_PLANE))} />
                <polygon className="is-gate05-quad" points={platformPoints} />
                <circle className="is-center" cx="726.5" cy="363" r="5" />
              </g>
            )}
            {isGate05 && localPlatformDebug === 'coverage' && (
              <g className="milestone-atlas-structure__l3-coverage-debug">
                <polygon className="is-platform-quad" points={platformPoints} />
                <polygon className="is-coverage-area" points={pointsToSvg(CAPABILITY_MODULE_COVERAGE)} />
                {CAPABILITY_MODULE_COVERAGE.map((point) => (
                  <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="5" />
                ))}
              </g>
            )}
          </svg>
        )}
        {isStructureV2 && <span className="milestone-atlas-structure__spine-extension" />}

        {mode === 'layered' && governanceOverlay}

        <div className="milestone-atlas-structure__governance-label">
          <strong>治理与评估</strong>
          <small>Governance / Evaluation</small>
          <span>横切全系统</span>
        </div>
          <svg className="milestone-atlas-structure__registration-debug" viewBox="0 0 1440 940">
            {layerDomainKinds.map((kind) => {
              const registration = isStructureV2
                ? getLayerRegistrationV2(kind)
                : getLayerRegistration(kind)
              return (
                <g
                  key={kind}
                  className={debugLayer === kind ? 'is-debug-target' : ''}
                  data-registration-layer={kind}
                >
                  <polygon
                    className="is-layer-surface"
                    points={pointsToSvg(quadToPoints(registration.layerSurface))}
                  />
                  <polygon
                    className="is-contact-plane"
                    points={pointsToSvg(quadToPoints(registration.targetContactPlane))}
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </ViewportPortal>

      {structureVariant === 'current' && <ViewportPortal>
        <svg className={`milestone-atlas-front-rims milestone-atlas-front-rims--${mode}`} viewBox="0 0 1440 940" aria-hidden="true">
          <defs>
            <clipPath id="atlas-shelf-front-lips">
              {/* The original scaffold's complete foreground rims, measured on its 1199×1312 pixels. */}
              <path d="M561 180 L720 275 L877 180 L843 190 L720 261 L596 190 Z" />
              <path d="M561 180 L720 275 L877 180 L877 198 L720 292 L561 198 Z" />
              <path d="M561 315 L720 416 L877 315 L843 326 L720 402 L596 326 Z" />
              <path d="M561 315 L720 416 L877 315 L877 330 L720 431 L561 330 Z" />
              <path d="M561 456 L720 557 L877 456 L843 467 L720 543 L596 467 Z" />
              <path d="M561 456 L720 557 L877 456 L877 471 L720 572 L561 471 Z" />
              <path d="M561 586 L720 692 L877 586 L843 594 L720 675 L596 594 Z" />
              <path d="M561 586 L720 692 L877 586 L877 601 L720 707 L561 601 Z" />
            </clipPath>
          </defs>
          <image
            href={layeredScaffoldUrl}
            x="396" y="59" width="648" height="709"
            preserveAspectRatio="none"
            clipPath="url(#atlas-shelf-front-lips)"
          />
        </svg>
      </ViewportPortal>}

    </>
  )
}
