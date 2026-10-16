import { describe, expect, it } from 'vitest'
import { preserveP1Experiment, reduceSurfaceHandoff } from './surfaceHandoff.ts'

describe('S0-L and S1 surface handoff', () => {
  it('preserves the isolated P1 flag while moving between S0-L and S1', () => {
    expect(preserveP1Experiment('?view=layered&p1=1', '?view=s1')).toBe('?view=s1&p1=1')
    expect(preserveP1Experiment('?view=s1&p1=1', '?view=layered')).toBe('?view=layered&p1=1')
    expect(preserveP1Experiment('?view=layered', '?view=s1')).toBe('?view=s1')
  })

  it('keeps the outgoing surface mounted until the fade-out midpoint, then enters the target', () => {
    const leaving = reduceSurfaceHandoff({ surface: 'atlas', phase: 'idle', target: null }, { type: 'start', target: 's1' })
    expect(leaving).toEqual({ surface: 'atlas', phase: 'out', target: 's1' })
    const entering = reduceSurfaceHandoff(leaving, { type: 'switch' })
    expect(entering).toEqual({ surface: 's1', phase: 'in', target: 's1' })
    expect(reduceSurfaceHandoff(entering, { type: 'finish' })).toEqual({ surface: 's1', phase: 'idle', target: null })
  })

  it('uses the same sequence returning to S0-L and ignores duplicate starts', () => {
    const leaving = reduceSurfaceHandoff({ surface: 's1', phase: 'idle', target: null }, { type: 'start', target: 'atlas' })
    expect(reduceSurfaceHandoff(leaving, { type: 'start', target: 's1' })).toEqual(leaving)
    expect(reduceSurfaceHandoff(leaving, { type: 'switch' })).toEqual({ surface: 'atlas', phase: 'in', target: 'atlas' })
  })

  it('lets browser history synchronize immediately without a stale animation', () => {
    const leaving = reduceSurfaceHandoff({ surface: 'atlas', phase: 'out', target: 's1' }, { type: 'sync', surface: 'atlas' })
    expect(leaving).toEqual({ surface: 'atlas', phase: 'idle', target: null })
  })
})
