export type S2ReadingAction =
  | { type: 'open'; nodeCode: string | null; cardOpen: boolean; eligible?: boolean }
  | { type: 'close' }

export function reduceS2Reading(_open: boolean, action: S2ReadingAction): boolean {
  if (action.type === 'close') return false
  return (action.nodeCode === 'H02' || action.eligible === true) && action.cardOpen
}
