import type { NodeProps } from '@xyflow/react'
import { pointsToSvg, quadToPoints } from './atlasRegistration.ts'
import type { AtlasNode } from './atlasViewModel.ts'

// Each solid shelf is in front of the visual belonging to the level below it.
// These silhouettes are measured in the same graph coordinates as the A scaffold.
const UPPER_SHELF_SILHOUETTE: Partial<Record<string, string>> = {
  // Extend the L4 foreground a few graph units so the L3 rear purple rim
  // disappears behind it instead of peeking through the shelf edge.
  capability: 'M720 89 L877 180 L877 205 L720 303 L561 205 L561 180 Z',
  runtime: 'M720 253 L877 315 L877 330 L720 431 L561 330 L561 315 Z',
  resources: 'M720 397 L877 456 L877 471 L720 572 L561 471 L561 456 Z',
}

type L3DiagnosticVariant = 'current' | 'mask' | 'grounding'

function getL3DiagnosticVariant(): L3DiagnosticVariant | undefined {
  const query = new URLSearchParams(window.location.search)
  if (query.get('visualDiag') !== 'l3') return undefined

  const variant = query.get('diagVariant')
  return variant === 'mask' || variant === 'grounding' ? variant : 'current'
}

function RegisteredAssetVisual({
  assetUrl,
  sourceSize,
  diagnosticVariant,
}: {
  assetUrl: string
  sourceSize: { width: number; height: number }
  diagnosticVariant?: L3DiagnosticVariant
}) {
  const maskId = 'l3-capability-database-mask'
  const clipId = 'l3-capability-database-clip'
  const shadowId = 'l3-capability-contact-shadow'

  if (!diagnosticVariant || diagnosticVariant === 'current') {
    return (
      <image
        className="milestone-atlas-node__registered-asset"
        href={assetUrl}
        width={sourceSize.width}
        height={sourceSize.height}
        preserveAspectRatio="none"
      />
    )
  }

  return (
    <g className="milestone-atlas-node__registered-asset milestone-atlas-node__registered-asset--diagnostic">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
          <rect width="1536" height="1024" fill="white" />
          <rect x="365" y="72" width="278" height="350" rx="88" fill="black" />
          <ellipse cx="505" cy="392" rx="151" ry="48" fill="black" />
          <path d="M586 244 C650 267 673 300 718 355" fill="none" stroke="black" strokeLinecap="round" strokeWidth="68" />
        </mask>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x="365" y="72" width="278" height="350" rx="88" />
          <ellipse cx="505" cy="392" rx="151" ry="48" />
          <path d="M586 244 C650 267 673 300 718 355" fill="none" stroke="black" strokeLinecap="round" strokeWidth="68" />
        </clipPath>
        <filter id={shadowId} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <image
        href={assetUrl}
        width={sourceSize.width}
        height={sourceSize.height}
        preserveAspectRatio="none"
        mask={`url(#${maskId})`}
      />

      {diagnosticVariant === 'grounding' && (
        <g data-l3-local-grounding="true">
          <ellipse
            cx="505"
            cy="404"
            rx="118"
            ry="20"
            fill="rgb(76 60 126 / 24%)"
            filter={`url(#${shadowId})`}
          />
          <g clipPath={`url(#${clipId})`} transform="translate(0 4)">
            <image
              href={assetUrl}
              width={sourceSize.width}
              height={sourceSize.height}
              preserveAspectRatio="none"
            />
          </g>
          <path
            d="M395 397 C438 414 559 418 621 393"
            fill="none"
            stroke="rgb(235 240 253 / 72%)"
            strokeLinecap="round"
            strokeWidth="7"
          />
        </g>
      )}
    </g>
  )
}

export function AtlasAssetNode({ data, selected }: NodeProps<AtlasNode>) {
  const isCore = data.kind === 'core'
  const isRegisteredLayer = data.mode === 'layered' && data.registration !== undefined
  const visualStyle = data.visualAnchor
    ? {
        '--asset-offset-x': `${data.visualAnchor.offset.x}px`,
        '--asset-offset-y': `${data.visualAnchor.offset.y}px`,
        '--asset-scale': data.visualAnchor.offset.scale,
        '--asset-rotation': `${data.visualAnchor.offset.rotationDeg ?? 0}deg`,
        '--visual-center-x': `${data.visualAnchor.visualCenterX * 100}%`,
        '--visual-center-y': `${data.visualAnchor.visualCenterY * 100}%`,
        '--ground-contact-x': `${data.visualAnchor.groundContactX * 100}%`,
        '--ground-contact-y': `${data.visualAnchor.groundContactY * 100}%`,
      } as React.CSSProperties
    : {}

  const registeredMatrix = data.registration?.matrix
  const diagnosticVariant = data.kind === 'capability' && isRegisteredLayer
    ? getL3DiagnosticVariant()
    : undefined

  const registeredTransform = registeredMatrix
    ? `matrix(${registeredMatrix.a} ${registeredMatrix.b} ${registeredMatrix.c} ${registeredMatrix.d} ${registeredMatrix.e} ${registeredMatrix.f})`
    : undefined
  const upperShelfSilhouette = isRegisteredLayer ? UPPER_SHELF_SILHOUETTE[data.kind] : undefined
  const upperShelfMaskId = `atlas-upper-shelf-${data.kind}`

  return (
    <article
      className={`milestone-atlas-node milestone-atlas-node--${data.kind} milestone-atlas-node--${data.mode}${selected ? ' is-selected' : ''}`}
      style={{ '--node-accent': data.accent, ...visualStyle } as React.CSSProperties}
      aria-label={`${data.title} ${data.term}`}
    >
      {!isRegisteredLayer && <div className="milestone-atlas-node__focus" aria-hidden="true" />}
      {isRegisteredLayer && data.registration && registeredTransform ? (
        <svg
          className="milestone-atlas-node__registered-surface"
          viewBox="0 0 1440 940"
          width="1440"
          height="940"
          style={{ left: -data.logicalPosition.x, top: -data.logicalPosition.y }}
          data-registration-kind={data.kind}
          aria-hidden="true"
        >
          {upperShelfSilhouette && (
            <defs>
              <mask id={upperShelfMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="940">
                <rect width="1440" height="940" fill="white" />
                <path d={upperShelfSilhouette} fill="black" />
              </mask>
            </defs>
          )}
          <g mask={upperShelfSilhouette ? `url(#${upperShelfMaskId})` : undefined}>
          <g className="milestone-atlas-node__registered-group" transform={registeredTransform}>
            <RegisteredAssetVisual
              assetUrl={data.assetUrl}
              sourceSize={data.registration.sourceSize}
              diagnosticVariant={diagnosticVariant}
            />
            <polygon
              className="milestone-atlas-node__registered-focus"
              points={pointsToSvg(data.registration.interactionHull)}
            />
            <polygon
              className="milestone-atlas-node__interaction-hull nopan nodrag"
              points={pointsToSvg(data.registration.interactionHull)}
            />
            <polygon
              className="milestone-atlas-node__source-footprint"
              points={pointsToSvg(quadToPoints(data.registration.assetFootprint))}
            />
          </g>
          </g>
        </svg>
      ) : (
        <img
          className="milestone-atlas-node__asset"
          src={data.assetUrl}
          alt=""
          draggable={false}
        />
      )}
      <div className="milestone-atlas-node__alignment-debug" aria-hidden="true">
        <i className="is-logical" />
        <i className="is-visual" />
        <i className="is-contact" />
      </div>

      <div className="milestone-atlas-node__annotation">
        {data.layer && <span className="milestone-atlas-node__layer">{data.layer}</span>}
        <span className="milestone-atlas-node__leader" aria-hidden="true" />
        <span className="milestone-atlas-node__copy">
          <strong>{data.title}</strong>
          <small>{data.term}</small>
          {data.mode === 'layered' && <em>{data.description}</em>}
        </span>
      </div>

      {isCore && (
        <span className="milestone-atlas-node__core-action">
          {data.mode === 'overview' ? '拆解系统' : '重新组合'}
        </span>
      )}
    </article>
  )
}
