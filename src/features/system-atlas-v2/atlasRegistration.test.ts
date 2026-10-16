import { describe, expect, it } from 'vitest'
import {
  applyRegistrationMatrix,
  getLayerRegistration,
  getLayerZIndex,
  layerDomainKinds,
  solveUniformRegistration,
} from './atlasRegistration.ts'

describe('A layered visual and interaction registration', () => {
  it('defines measured source footprints and target contact quadrilaterals for every layer', () => {
    for (const kind of layerDomainKinds) {
      const registration = getLayerRegistration(kind)

      expect(registration.sourceSize).toEqual({ width: 1536, height: 1024 })
      expect(Object.values(registration.assetFootprint)).toHaveLength(4)
      expect(Object.values(registration.targetContactPlane)).toHaveLength(4)
      expect(registration.interactionHull.length).toBeGreaterThanOrEqual(8)
      expect(Object.values(registration.layerSurface)).toHaveLength(4)
    }
  })

  it('uses one uniform registration matrix for visual, focus and interaction geometry', () => {
    for (const kind of layerDomainKinds) {
      const registration = getLayerRegistration(kind)
      const solved = solveUniformRegistration(
        registration.assetFootprint,
        registration.targetContactPlane,
      )

      expect(solved.a).toBeCloseTo(solved.d, 8)
      expect(solved.b).toBe(0)
      expect(solved.c).toBe(0)
      expect(solved).toEqual(registration.matrix)

      for (const corner of Object.keys(registration.assetFootprint) as Array<keyof typeof registration.assetFootprint>) {
        const actual = applyRegistrationMatrix(registration.matrix, registration.assetFootprint[corner])
        const expected = registration.targetContactPlane[corner]
        expect(actual.x).toBeCloseTo(expected.x, 1)
        expect(actual.y).toBeCloseTo(expected.y, 1)
      }
    }
  })

  it('keeps each registered contact plane inside the solid shelf front rim', () => {
    for (const kind of layerDomainKinds) {
      const registration = getLayerRegistration(kind)
      const frontClearance = registration.layerSurface.frontRight.y
        - registration.targetContactPlane.frontRight.y

      expect(registration.matrix.a).toBeCloseTo(0.16, 4)
      expect(frontClearance).toBeGreaterThanOrEqual(30)
    }
  })

  it('keeps every interaction hull in source-image coordinates instead of using the PNG canvas rectangle', () => {
    for (const kind of layerDomainKinds) {
      const registration = getLayerRegistration(kind)
      const xs = registration.interactionHull.map((point) => point.x)
      const ys = registration.interactionHull.map((point) => point.y)

      expect(Math.min(...xs)).toBeGreaterThan(0)
      expect(Math.min(...ys)).toBeGreaterThan(0)
      expect(Math.max(...xs)).toBeLessThan(registration.sourceSize.width)
      expect(Math.max(...ys)).toBeLessThan(registration.sourceSize.height)
    }
  })

  it('uses an explicit, unique front-to-back layer order', () => {
    const zIndexes = layerDomainKinds.map(getLayerZIndex)
    expect(new Set(zIndexes).size).toBe(layerDomainKinds.length)
    expect(getLayerZIndex('resources')).toBeGreaterThan(getLayerZIndex('runtime'))
    expect(getLayerZIndex('runtime')).toBeGreaterThan(getLayerZIndex('capability'))
    expect(getLayerZIndex('capability')).toBeGreaterThan(getLayerZIndex('business'))
  })
})
