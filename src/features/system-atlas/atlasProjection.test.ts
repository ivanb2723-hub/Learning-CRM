import { describe, expect, it } from 'vitest'

import * as atlasProjection from './atlasProjection.ts'

const { projectAtlas } = atlasProjection

describe('System Atlas projection', () => {
  it('reuses the same system identities across overview and layered modes', () => {
    const overview = projectAtlas('overview')
    const layered = projectAtlas('layered')

    expect(layered.map(({ id }) => id)).toEqual(overview.map(({ id }) => id))
    expect(layered.map(({ data }) => data.label)).toEqual(
      overview.map(({ data }) => data.label),
    )
    expect(layered.map(({ position }) => position)).not.toEqual(
      overview.map(({ position }) => position),
    )
  })

  it('keeps Governance / Evaluation as a cross-cutting overlay', () => {
    const overlay = projectAtlas('overview').find(({ id }) => id === 'atlas:overlay')
    expect(overlay?.data.kind).toBe('overlay')
    expect(overlay?.zIndex).toBe(-1)
  })

  it('preserves the frozen spatial identity of the four domains in S0', () => {
    const nodes = projectAtlas('overview')
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]))
    const agent = byId['atlas:agent']

    expect(byId['atlas:business'].position.y).toBeLessThan(agent.position.y)
    expect(byId['atlas:resources'].position.x).toBeLessThan(agent.position.x)
    expect(byId['atlas:capability'].position.x).toBeGreaterThan(agent.position.x)
    expect(byId['atlas:harness'].position.y).toBeGreaterThan(agent.position.y)
  })

  it('projects A as one exploded system in the frozen layer order', () => {
    const layerIds = projectAtlas('layered')
      .filter(({ data }) => data.kind === 'domain')
      .sort((left, right) => left.position.y - right.position.y)
      .map(({ id }) => id)

    expect(layerIds).toEqual([
      'atlas:business',
      'atlas:capability',
      'atlas:harness',
      'atlas:resources',
    ])
  })

  it('numbers the exploded layers from infrastructure L1 to business L4', () => {
    const layers = Object.fromEntries(
      projectAtlas('layered')
        .filter(({ data }) => data.kind === 'domain')
        .map(({ id, data }) => [id, data.layerIndex]),
    )

    expect(layers).toEqual({
      'atlas:business': 4,
      'atlas:harness': 2,
      'atlas:capability': 3,
      'atlas:resources': 1,
    })
  })

  it('provides Chinese-first bilingual labels without changing node identity', () => {
    const business = projectAtlas('overview').find(
      ({ id }) => id === 'atlas:business',
    )

    expect(business?.data.labelZh).toBe('业务与产品')
    expect(business?.data.labelEn).toBe('Business & Product')
    expect(business?.data.mode).toBe('overview')
  })

  it('projects visual roles for regions, the system core, and the cross-cutting plane', () => {
    const nodes = projectAtlas('overview')
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]))
    const visualRole = (id: string) => byId[id]?.data.visualRole

    expect(visualRole('atlas:business')).toBe('region')
    expect(visualRole('atlas:agent')).toBe('core')
    expect(visualRole('atlas:overlay')).toBe('cross-cutting-plane')
  })

  it('assigns persistent module blocks to every system region', () => {
    const regions = projectAtlas('layered').filter(
      ({ data }) => data.kind === 'domain',
    )

    for (const region of regions) {
      const modules = (
        region.data as unknown as { modules?: readonly string[] }
      ).modules
      expect(modules?.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('schedules a final viewport fit after the geometry transition settles', () => {
    const fitSchedule = (
      atlasProjection as unknown as {
        getAtlasFitSchedule?: (mode: string) => readonly number[]
      }
    ).getAtlasFitSchedule?.('overview')

    expect(fitSchedule?.at(0)).toBe(0)
    expect(fitSchedule?.at(-1)).toBeGreaterThan(760)
  })
})
