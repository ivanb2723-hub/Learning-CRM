import { describe, expect, it } from 'vitest'
import { createGateNodes, moveResourcesNode } from './visualAssetGateModel.ts'

describe('Visual Asset Gate node model', () => {
  it('keeps stable node identities for the core and resources assets', () => {
    const nodes = createGateNodes()

    expect(nodes.map((node) => node.id)).toEqual(['crm-core', 'resources'])
    expect(nodes.every((node) => node.draggable === false)).toBe(true)
  })

  it('moves only the resources node to the verification position', () => {
    const initial = createGateNodes()
    const moved = moveResourcesNode(initial, true)

    expect(moved[0].position).toEqual(initial[0].position)
    expect(moved[1].position).not.toEqual(initial[1].position)
    expect(moveResourcesNode(moved, false)[1].position).toEqual(initial[1].position)
  })
})
