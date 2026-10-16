export type AtlasSurface = 'atlas' | 's1'
export type SurfaceHandoff = { surface: AtlasSurface; phase: 'idle' | 'out' | 'in'; target: AtlasSurface | null }
export type SurfaceHandoffAction =
  | { type: 'start'; target: AtlasSurface }
  | { type: 'switch' }
  | { type: 'finish' }
  | { type: 'sync'; surface: AtlasSurface }

export function preserveP1Experiment(currentSearch: string, nextSearch: string) {
  const current = new URLSearchParams(currentSearch)
  const next = new URLSearchParams(nextSearch)
  if (current.get('p1') === '1') next.set('p1', '1')
  const serialized = next.toString()
  return serialized ? `?${serialized}` : ''
}

export function reduceSurfaceHandoff(state: SurfaceHandoff, action: SurfaceHandoffAction): SurfaceHandoff {
  if (action.type === 'sync') return { surface: action.surface, phase: 'idle', target: null }
  if (action.type === 'start') {
    return state.phase === 'idle' && state.surface !== action.target
      ? { ...state, phase: 'out', target: action.target }
      : state
  }
  if (action.type === 'switch') {
    return state.phase === 'out' && state.target
      ? { surface: state.target, phase: 'in', target: state.target }
      : state
  }
  return state.phase === 'in' ? { surface: state.surface, phase: 'idle', target: null } : state
}
