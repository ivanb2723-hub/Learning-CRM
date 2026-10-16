type EditPayload = Record<string, string>
type LegacyStorage = { learned: Record<string, boolean>; edits: Record<string, EditPayload> }
type MigratedStorage = { version: 1; learned: Record<string, boolean>; edits: Record<string, EditPayload>; legacy: LegacyStorage; unresolved: string[] }

const idMap: Record<string, string> = {
  'node:h02-context': 'MIN-K03',
  'card:h02-context': 'MIN-K03',
  'card:h05-loop': 'MIN-K02',
}

export function migrateP1Storage(input: LegacyStorage | MigratedStorage): { output: MigratedStorage; backup: LegacyStorage; unresolved: string[] } {
  if ('version' in input && input.version === 1) return { output: input, backup: input.legacy, unresolved: input.unresolved }
  const unresolved: string[] = []
  const learned: Record<string, boolean> = {}
  const edits: Record<string, EditPayload> = {}
  for (const [legacyId, value] of Object.entries(input.learned)) {
    const objectId = idMap[legacyId]
    if (objectId) learned[objectId] = value
    else unresolved.push(legacyId)
  }
  for (const [legacyId, value] of Object.entries(input.edits)) {
    const objectId = idMap[legacyId]
    if (objectId) edits[objectId] = structuredClone(value)
    else unresolved.push(legacyId)
  }
  const backup = structuredClone(input)
  return { output: { version: 1, learned, edits, legacy: backup, unresolved }, backup, unresolved }
}
