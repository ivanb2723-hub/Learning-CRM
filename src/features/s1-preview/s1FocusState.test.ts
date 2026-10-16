import { describe, expect, it } from 'vitest'
import { reduceS1Focus } from './s1FocusState.ts'

describe('S1 Focus/Card independent state', () => {
  it('opens Card on selection, closes only Card, and exits Focus separately', () => {
    const selected = reduceS1Focus({ nodeCode: null, cardOpen: false }, { type: 'select', code: 'H02' })
    expect(selected).toEqual({ nodeCode: 'H02', cardOpen: true })
    const closed = reduceS1Focus(selected, { type: 'close-card' })
    expect(closed).toEqual({ nodeCode: 'H02', cardOpen: false })
    expect(reduceS1Focus(closed, { type: 'exit-focus' })).toEqual({ nodeCode: null, cardOpen: false })
  })

  it('switches to another Node and reopens its Card state', () => {
    expect(reduceS1Focus({ nodeCode: 'H02', cardOpen: false }, { type: 'select', code: 'H01' })).toEqual({ nodeCode: 'H01', cardOpen: true })
  })

  it('dismisses the Card on a blank canvas press without clearing the focused Node', () => {
    expect(reduceS1Focus({ nodeCode: 'H02', cardOpen: true }, { type: 'background-press' })).toEqual({ nodeCode: 'H02', cardOpen: false })
  })
})
