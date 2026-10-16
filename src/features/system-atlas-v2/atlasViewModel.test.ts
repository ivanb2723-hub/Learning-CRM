import { describe, expect, it } from 'vitest'
import {
  createAtlasNodes,
  getAtlasVisualAnchor,
  getAtlasNodePositions,
  getAtlasSearch,
  getAtlasViewport,
  nextAtlasMode,
  type AtlasMode,
} from './atlasViewModel.ts'

type TestPoint = { x: number; y: number }

function distanceInsideConvexQuad(point: TestPoint, quad: readonly (readonly [number, number])[]): number {
  return Math.min(...quad.map(([x, y], index) => {
    const [nextX, nextY] = quad[(index + 1) % quad.length]
    const edgeX = nextX - x
    const edgeY = nextY - y
    return (edgeX * (point.y - y) - edgeY * (point.x - x)) / Math.hypot(edgeX, edgeY)
  }))
}

function overviewContactPoint(
  kind: 'resources' | 'capability' | 'runtime',
  source: TestPoint,
): TestPoint {
  const id = {
    resources: 'resources-infrastructure',
    capability: 'capability',
    runtime: 'agent-runtime',
  }[kind]
  const position = getAtlasNodePositions('overview')[id]
  const anchor = getAtlasVisualAnchor(kind)
  const sourceScale = 430 / 1536
  const letterboxY = (290 - 1024 * sourceScale) / 2
  const radians = ((anchor.overview.rotationDeg ?? 0) * Math.PI) / 180
  const dx = source.x * sourceScale - anchor.visualCenterX * 430
  const dy = letterboxY + source.y * sourceScale - anchor.visualCenterY * 290

  return {
    x: position.x + anchor.visualCenterX * 430 + anchor.overview.x
      + anchor.overview.scale * (dx * Math.cos(radians) - dy * Math.sin(radians)),
    y: position.y + anchor.visualCenterY * 290 + anchor.overview.y
      + anchor.overview.scale * (dx * Math.sin(radians) + dy * Math.cos(radians)),
  }
}

describe('Milestone A atlas view model', () => {
  it('keeps one stable identity for the core and four domains in S0 and A', () => {
    const s0Ids = createAtlasNodes('overview').map((node) => node.id)
    const layeredIds = createAtlasNodes('layered').map((node) => node.id)

    expect(s0Ids).toEqual([
      'business-product',
      'resources-infrastructure',
      'capability',
      'agent-runtime',
      'crm-core',
    ])
    expect(layeredIds).toEqual(s0Ids)
  })

  it('preserves the frozen S0 spatial identity and A layer order', () => {
    const s0 = getAtlasNodePositions('overview')
    const layered = getAtlasNodePositions('layered')

    expect(s0['business-product'].y).toBeLessThan(s0['crm-core'].y)
    expect(s0['resources-infrastructure'].x).toBeLessThan(s0['crm-core'].x)
    expect(s0.capability.x).toBeGreaterThan(s0['crm-core'].x)
    expect(s0['agent-runtime'].y).toBeGreaterThan(s0['crm-core'].y)

    expect(layered['business-product'].y).toBeLessThan(layered.capability.y)
    expect(layered.capability.y).toBeLessThan(layered['agent-runtime'].y)
    expect(layered['agent-runtime'].y).toBeLessThan(layered['resources-infrastructure'].y)
  })

  it('toggles bidirectionally without introducing another state', () => {
    const start: AtlasMode = 'overview'
    const layered = nextAtlasMode(start)

    expect(layered).toBe('layered')
    expect(nextAtlasMode(layered)).toBe('overview')
  })

  it('freezes the four domain identity colors', () => {
    const nodes = createAtlasNodes('overview')
    const colors = Object.fromEntries(nodes.map((node) => [node.id, node.data.accent]))

    expect(colors).toMatchObject({
      'business-product': '#f29b38',
      'resources-infrastructure': '#16a79b',
      capability: '#8068e8',
      'agent-runtime': '#2694e8',
    })
  })

  it('serializes only stable view state without an empty query marker', () => {
    expect(getAtlasSearch('overview')).toBe('')
    expect(getAtlasSearch('layered')).toBe('?view=layered')
  })

  it('uses a stable A viewport that includes registered visuals outside logical node boxes', () => {
    expect(getAtlasViewport('overview')).toEqual({ x: 15.16, y: 3.54, zoom: 0.748 })
    expect(getAtlasViewport('layered')).toEqual({ x: 115, y: -40, zoom: 0.64 })
  })

  it('keeps S0 byte-for-byte stable when the A-v2 feature flag is present', () => {
    expect(createAtlasNodes('overview', 'v2')).toEqual(createAtlasNodes('overview', 'current'))
    expect(getAtlasViewport('overview', 'v2')).toEqual(getAtlasViewport('overview', 'current'))
  })

  it('keeps canonical identities while giving A-v2 independent positions and registration', () => {
    const current = createAtlasNodes('layered', 'current')
    const v2 = createAtlasNodes('layered', 'v2')

    expect(v2.map((node) => node.id)).toEqual(current.map((node) => node.id))
    expect(v2.find((node) => node.id === 'agent-runtime')?.data.registration?.matrix.f)
      .not.toBe(current.find((node) => node.id === 'agent-runtime')?.data.registration?.matrix.f)
    expect(getAtlasNodePositions('layered', 'v2')['agent-runtime'].y)
      .toBeGreaterThan(getAtlasNodePositions('layered', 'current')['agent-runtime'].y)
  })

  it('serializes A-v2 independently without changing the A-current URL', () => {
    expect(getAtlasSearch('layered', 'current')).toBe('?view=layered')
    expect(getAtlasSearch('layered', 'v2')).toBe('?view=layered&aStructure=v2')
    expect(getAtlasSearch('overview', 'v2')).toBe('?aStructure=v2')
  })

  it('separates logical node positions from calibrated visual anchors', () => {
    const s0Position = getAtlasNodePositions('overview')['resources-infrastructure']
    const layeredPosition = getAtlasNodePositions('layered')['resources-infrastructure']
    const resourcesAnchor = getAtlasVisualAnchor('resources')

    expect(s0Position).toEqual({ x: 70, y: 312 })
    expect(layeredPosition).toEqual({ x: 510, y: 690 })
    expect(resourcesAnchor.overview.x).toBeGreaterThan(125)
    expect(resourcesAnchor.overview.x).toBeLessThan(160)
    expect(resourcesAnchor.overview.scale).toBeGreaterThanOrEqual(0.74)
    expect(resourcesAnchor.layered).toEqual({ x: 15, y: -190, scale: 0.92 })
  })

  it('provides normalized visual-center and ground-contact anchors for every asset', () => {
    const kinds = ['business', 'resources', 'capability', 'runtime', 'core'] as const

    for (const kind of kinds) {
      const anchor = getAtlasVisualAnchor(kind)
      expect(anchor.visualCenterX).toBeGreaterThan(0)
      expect(anchor.visualCenterX).toBeLessThan(1)
      expect(anchor.visualCenterY).toBeGreaterThan(0)
      expect(anchor.visualCenterY).toBeLessThan(1)
      expect(anchor.groundContactX).toBeGreaterThan(0)
      expect(anchor.groundContactX).toBeLessThan(1)
      expect(anchor.groundContactY).toBeGreaterThan(anchor.visualCenterY)
      expect(anchor.groundContactY).toBeLessThanOrEqual(1)
    }
  })

  it('replaces layered point offsets with footprint registration without changing identity', () => {
    const overview = createAtlasNodes('overview')
    const layered = createAtlasNodes('layered')
    const overviewRuntime = overview.find((node) => node.id === 'agent-runtime')
    const layeredRuntime = layered.find((node) => node.id === 'agent-runtime')

    expect(overviewRuntime?.data.visualAnchor?.offset.scale).toBeGreaterThanOrEqual(0.68)
    expect(layeredRuntime?.data.visualAnchor).toBeUndefined()
    expect(layeredRuntime?.data.registration?.kind).toBe('runtime')
    expect(layeredRuntime?.data.registration?.matrix.a).toBeCloseTo(0.16, 4)
    expect(layeredRuntime?.id).toBe(overviewRuntime?.id)
  })

  it('seats the S0 core on the shared system center', () => {
    const core = createAtlasNodes('overview').find((node) => node.id === 'crm-core')
    const anchor = getAtlasVisualAnchor('core')
    const visualCenterX = (core?.position.x ?? 0) + 300 * anchor.visualCenterX + anchor.overview.x

    expect(Math.abs(visualCenterX - 720)).toBeLessThan(5)
  })

  it('preserves the approved S0 Business placement', () => {
    expect(getAtlasVisualAnchor('business').overview).toEqual({ x: -12, y: 50, scale: 0.8 })
  })

  it('fits measured S0 component silhouettes into their inner carrying floors', () => {
    // Source bounds exclude transparent canvas and peripheral alpha artifacts.
    // Targets are in the 1440×940 graph space and come from the reference's
    // subject-to-inner-floor proportions, not the outer platform or node box.
    const cases = {
      resources: { source: [220, 120, 1300, 870], target: [316, 339, 560, 505] },
      capability: { source: [260, 100, 1400, 910], target: [914, 351, 1144, 513] },
    } as const

    for (const kind of ['resources', 'capability'] as const) {
      const [left, top, right, bottom] = cases[kind].source
      const [targetLeft, targetTop, targetRight, targetBottom] = cases[kind].target
      const actualTopLeft = overviewContactPoint(kind, { x: left, y: top })
      const actualBottomRight = overviewContactPoint(kind, { x: right, y: bottom })
      // The approximate silhouette target is secondary to the measured 12-unit
      // inner-floor safety inset asserted below. A small set-back is intentional.
      expect(Math.abs(actualTopLeft.x - targetLeft), `${kind} left`).toBeLessThan(28)
      expect(Math.abs(actualTopLeft.y - targetTop), `${kind} top`).toBeLessThan(28)
      expect(Math.abs(actualBottomRight.x - targetRight), `${kind} right`).toBeLessThan(28)
      expect(Math.abs(actualBottomRight.y - targetBottom), `${kind} bottom`).toBeLessThan(28)
    }
  })

  it('matches the reference S0 subject occupancy while keeping contact groups on their planes', () => {
    // Samples are on visible modules, not transparent image bounds. Their vertical
    // faces can project past a sloped floor edge, so constrain their aggregate
    // footprint and frontmost contact rather than every pixel to the floor polygon.
    const contacts = {
      resources: {
        source: [[370, 690], [600, 810], [900, 865], [1180, 825]],
        target: [[422, 325], [603, 430], [422, 545], [237, 430]],
        minSpread: 170,
      },
      capability: {
        source: [[280, 625], [465, 870], [1110, 910], [1380, 650]],
        target: [[1018, 323], [1197, 425], [1018, 544], [845, 425]],
        minSpread: 205,
      },
      runtime: {
        // The right-hand device contacts the floor near 1330,700; the former
        // 1380,740 sample landed in its cast shadow outside the device.
        source: [[180, 500], [620, 840], [900, 940], [1330, 700]],
        target: [[720, 519], [914, 619], [720, 750], [525, 619]],
        minSpread: 215,
      },
    } as const

    for (const kind of ['resources', 'capability', 'runtime'] as const) {
      const { source, target, minSpread } = contacts[kind]
      const points = source.map(([x, y]) => overviewContactPoint(kind, { x, y }))
      const [minX, maxX] = [Math.min(...target.map(([x]) => x)), Math.max(...target.map(([x]) => x))]
      const [backY, frontY] = [Math.min(...target.map(([, y]) => y)), Math.max(...target.map(([, y]) => y))]
      const targetCenterX = (minX + maxX) / 2
      const targetCenterY = (backY + frontY) / 2
      const subjectCenterX = points.reduce((sum, point) => sum + point.x, 0) / points.length
      const subjectCenterY = points.reduce((sum, point) => sum + point.y, 0) / points.length

      // Runtime's accepted S0 preview centers the complete contact group on
      // the inner carrying floor; a wide tolerance hid the earlier left bias.
      expect(Math.abs(subjectCenterX - targetCenterX), `${kind} should be centered left-to-right`)
        .toBeLessThan(kind === 'runtime' ? 8 : 20)
      expect(subjectCenterY - targetCenterY, `${kind} should not retreat behind its plane`).toBeGreaterThan(0)
      expect(subjectCenterY - targetCenterY).toBeLessThan(60)
      expect(Math.min(...points.map((point) => point.x))).toBeGreaterThan(minX + 10)
      expect(Math.max(...points.map((point) => point.x))).toBeLessThan(maxX - 10)
      expect(Math.max(...points.map((point) => point.y)), `${kind} should not cross the front rim`).toBeLessThan(frontY + 5)
      expect(Math.max(...points.map((point) => point.x)) - Math.min(...points.map((point) => point.x)), `${kind} should fill the floor like the reference`).toBeGreaterThanOrEqual(minSpread)
    }
  })

  it('keeps all measured S0 contact points inside their actual sloped floor polygons', () => {
    const cases = {
      resources: {
        source: [[370, 690], [600, 810], [900, 865], [1180, 825]],
        floor: [[422, 325], [603, 430], [422, 545], [237, 430]],
      },
      capability: {
        source: [[280, 625], [465, 870], [1110, 910], [1380, 650]],
        floor: [[1018, 323], [1197, 425], [1018, 544], [845, 425]],
      },
      runtime: {
        source: [[180, 500], [620, 840], [900, 940], [1330, 700]],
        floor: [[720, 519], [914, 619], [720, 750], [525, 619]],
      },
    } as const

    for (const kind of ['resources', 'capability', 'runtime'] as const) {
      const { source, floor } = cases[kind]
      for (const [x, y] of source) {
        const contact = overviewContactPoint(kind, { x, y })
        expect(distanceInsideConvexQuad(contact, floor), `${kind} contact ${x},${y}`).toBeGreaterThan(12)
      }
    }
  })

  it('registers the S0 Core body to the cavity plane, not its outer image box', () => {
    const position = getAtlasNodePositions('overview')['crm-core']
    const anchor = getAtlasVisualAnchor('core')
    const sourceScale = 245 / 1180
    const projectY = (sourceY: number) => position.y + anchor.visualCenterY * 245 + anchor.overview.y
      + anchor.overview.scale * (sourceY * sourceScale - anchor.visualCenterY * 245)
    const topY = projectY(240)
    const lowerBodyY = projectY(780)
    const projectedBodyWidth = (980 - 350) * sourceScale * anchor.overview.scale
    const cavityOuterWidth = (875 - 615) * (1140 / 1487)

    // The 0.8 Core leaves a dark moat. The 0.9 trial closes it but raises
    // the cap beyond the approved rear socket contour. This intermediate
    // ratio keeps the near side seated while the far shoulder stays aligned.
    expect(projectedBodyWidth / cavityOuterWidth).toBeGreaterThanOrEqual(0.55)
    expect(projectedBodyWidth / cavityOuterWidth).toBeLessThanOrEqual(0.57)
    expect(topY).toBeGreaterThanOrEqual(359)
    expect(topY).toBeLessThanOrEqual(365)
    expect(lowerBodyY).toBeGreaterThanOrEqual(454)
    expect(lowerBodyY).toBeLessThanOrEqual(461)
  })

  it('shifts the S0 Core along the ground-plane diagonal without changing its size or A registration', () => {
    const core = getAtlasVisualAnchor('core')
    // Equal X/Y ground-plane travel projects toward Business (screen up) at
    // fixed isometric angle. It is not a Z lift or a rescale of the asset.
    expect(core.overview).toEqual({ x: -40, y: -50, scale: 0.85 })
    expect(core.layered).toEqual({ x: 0, y: 0, scale: 0.88 })
  })

  it('aligns the S0 Runtime visible long edges with the floor while preserving its front inset', () => {
    const runtime = getAtlasVisualAnchor('runtime')
    // The user's translated guide lines all have a 0.65 rise/run. Measure
    // the actual module's two long edges, not its transparent image box or
    // the positions of its separate peripheral cubes.
    const moduleEdges = [
      [{ x: 528, y: 222 }, { x: 851, y: 401 }],
      [{ x: 402, y: 376 }, { x: 604, y: 493 }],
    ] as const
    for (const [start, end] of moduleEdges) {
      const a = overviewContactPoint('runtime', start)
      const b = overviewContactPoint('runtime', end)
      expect(Math.abs((b.y - a.y) / (b.x - a.x) - 0.65)).toBeLessThan(0.035)
    }

    // At the approved carrying floor's front tip (graph y=750), the visible
    // foreground module should leave a modest inset, not a vacant lower half.
    const foreground = overviewContactPoint('runtime', { x: 900, y: 940 })
    expect(750 - foreground.y).toBeGreaterThan(35)
    expect(750 - foreground.y).toBeLessThan(55)
    expect(runtime.layered).toEqual({ x: 15, y: -134, scale: 0.92 })
  })

  it('aligns the A core asset with the common shelf axis', () => {
    const core = createAtlasNodes('layered').find((node) => node.id === 'crm-core')
    const anchor = getAtlasVisualAnchor('core')
    const visualCenterX = (core?.position.x ?? 0) + 245 * anchor.visualCenterX + anchor.layered.x

    expect(Math.abs(visualCenterX - 720)).toBeLessThan(3)
  })
})
