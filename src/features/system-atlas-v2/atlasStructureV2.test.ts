import { describe, expect, it } from 'vitest'
import { getLayerRegistration, layerDomainKinds } from './atlasRegistration.ts'
import {
  A_STRUCTURE_V2_DECKS,
  A_STRUCTURE_V2_SPINE,
  getLayerDeckGeometry,
  getLayerRegistrationV2,
} from './atlasStructureV2.ts'

describe('A Structure V2 geometry', () => {
  it('gives every domain an independently sized solid deck', () => {
    expect(A_STRUCTURE_V2_DECKS.map((deck) => deck.kind)).toEqual([
      'business',
      'capability',
      'runtime',
      'resources',
    ])
    expect(new Set(A_STRUCTURE_V2_DECKS.map((deck) => `${deck.width}x${deck.depth}`)).size)
      .toBe(A_STRUCTURE_V2_DECKS.length)
    expect(getLayerDeckGeometry('runtime').width)
      .toBeGreaterThan(getLayerDeckGeometry('capability').width)
  })

  it('covers each registered support envelope with its deck bounds', () => {
    for (const deck of A_STRUCTURE_V2_DECKS) {
      const deckXs = Object.values(deck.topQuad).map((point) => point.x)
      const deckYs = Object.values(deck.topQuad).map((point) => point.y)
      const supportPoints = Object.values(deck.supportEnvelope)

      for (const point of supportPoints) {
        expect(point.x).toBeGreaterThanOrEqual(Math.min(...deckXs))
        expect(point.x).toBeLessThanOrEqual(Math.max(...deckXs))
        expect(point.y).toBeGreaterThanOrEqual(Math.min(...deckYs))
        expect(point.y).toBeLessThanOrEqual(Math.max(...deckYs))
      }
    }
  })

  it('uses one projection language for every deck', () => {
    for (const deck of A_STRUCTURE_V2_DECKS) {
      const leftRun = deck.topQuad.backLeft.x - deck.topQuad.frontLeft.x
      const rightRun = deck.topQuad.frontRight.x - deck.topQuad.backRight.x
      const projectedDepth = deck.topQuad.frontLeft.y - deck.topQuad.backLeft.y

      expect(leftRun).toBe(rightRun)
      expect(leftRun / projectedDepth).toBeGreaterThan(0.38)
      expect(leftRun / projectedDepth).toBeLessThan(0.56)
      expect(deck.thickness).toBeLessThan(10)
    }
  })

  it('keeps the shared spine continuous across all layer centers and the core', () => {
    expect(A_STRUCTURE_V2_SPINE.top).toBeLessThan(A_STRUCTURE_V2_DECKS[0].center.y)
    expect(A_STRUCTURE_V2_SPINE.bottom)
      .toBeGreaterThan(A_STRUCTURE_V2_DECKS[A_STRUCTURE_V2_DECKS.length - 1].center.y)
    expect(A_STRUCTURE_V2_DECKS.every((deck) => deck.center.x === A_STRUCTURE_V2_SPINE.x))
      .toBe(true)
  })

  it('moves visual and interaction geometry through the same uniform matrix', () => {
    for (const kind of layerDomainKinds) {
      const current = getLayerRegistration(kind)
      const v2 = getLayerRegistrationV2(kind)

      expect(v2.matrix.a).toBe(v2.matrix.d)
      expect(v2.matrix.b).toBe(0)
      expect(v2.matrix.c).toBe(0)
      expect(v2.interactionHull).toEqual(current.interactionHull)
      expect(v2.assetFootprint).toEqual(current.assetFootprint)
    }
  })
})
