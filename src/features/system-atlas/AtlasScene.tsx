import { ViewportPortal } from '@xyflow/react'

import type { AtlasMode } from './atlasProjection.ts'
import { SystemFabricVisual } from './SystemFabricVisual.tsx'

export function AtlasScene({ mode }: { mode: AtlasMode }) {
  return (
    <ViewportPortal>
      <div className={`atlas-scene atlas-scene--${mode}`} aria-hidden="true">
        {mode === 'overview' && <SystemFabricVisual />}

        <div className="atlas-scene__layer-axis" data-spine-role="structure">
          <span className="atlas-scene__axis-plane" />
          <span className="atlas-scene__axis-rail" />
          <span className="atlas-scene__axis-column atlas-scene__axis-column--left" />
          <span className="atlas-scene__axis-column atlas-scene__axis-column--right" />
          {[1, 2, 3, 4].map((layer) => (
            <span className="atlas-scene__axis-stop" data-layer={layer} key={layer} />
          ))}
          <span className="atlas-scene__axis-caption">
            系统结构轴
            <small>System spine</small>
          </span>
        </div>
      </div>
    </ViewportPortal>
  )
}
