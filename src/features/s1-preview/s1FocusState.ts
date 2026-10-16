export type S1FocusState = { nodeCode: string | null; cardOpen: boolean }
export type S1FocusAction = { type: 'select'; code: string } | { type: 'close-card' } | { type: 'background-press' } | { type: 'exit-focus' }

export function reduceS1Focus(state: S1FocusState, action: S1FocusAction): S1FocusState {
  if (action.type === 'select') return { nodeCode: action.code, cardOpen: true }
  if (action.type === 'close-card' || action.type === 'background-press') return { ...state, cardOpen: false }
  return { nodeCode: null, cardOpen: false }
}
