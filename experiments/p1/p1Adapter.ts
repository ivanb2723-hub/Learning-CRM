import type { P1Object, P1Relation } from './p1Fixture.ts'

export function validateSample(_objects: P1Object[], _relations: P1Relation[]) {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const object of _objects) {
    if (ids.has(object.id)) errors.push(`duplicate object: ${object.id}`)
    ids.add(object.id)
  }
  for (const relation of _relations) {
    if (!ids.has(relation.from)) errors.push(`${relation.id}: missing source ${relation.from}`)
    if (!ids.has(relation.to)) errors.push(`${relation.id}: missing target ${relation.to}`)
  }
  return { valid: errors.length === 0, errors }
}

export function resolveEntries(_entries: { objectId: string }[], _objects: P1Object[]) {
  const byId = new Map(_objects.map((object) => [object.id, object]))
  return _entries.map(({ objectId }) => {
    const object = byId.get(objectId)
    if (!object) throw new Error(`missing object: ${objectId}`)
    return object
  })
}

export function buildReaderModel(_object: P1Object) {
  if (_object.density === 'navigation') {
    return { mode: 'navigation', sections: [] as [string, string][] }
  }
  const sections = Object.entries(_object.sections ?? {})
  return {
    mode: _object.density === 'full' ? 'seven-field' : 'short',
    sections,
  }
}

export function projectS1(_objects: P1Object[], _relations: P1Relation[]) {
  return {
    nodes: _objects.map(({ id, kind, facets }) => ({ id, kind, facets })),
    edges: _relations.map(({ id, from, to, type }) => ({ id, from, to, type })),
    hierarchyEdges: _relations.filter(({ type }) => type === 'part-of').map(({ id }) => id),
  }
}

export function dryRunMigration(_input: {
  learned: string[]
  edits: { nodeId: string; payload: Record<string, string> }[]
}) {
  const legacyMap: Record<string, string> = {
    H02: 'MIN-K03',
    'node:h02-context': 'MIN-K03',
  }
  const unresolved: string[] = []
  const learned = _input.learned.flatMap((id) => {
    const mapped = legacyMap[id]
    if (!mapped) {
      unresolved.push(id)
      return []
    }
    return [mapped]
  })
  const edits = _input.edits.flatMap(({ nodeId, payload }) => {
    const objectId = legacyMap[nodeId]
    if (!objectId) {
      unresolved.push(nodeId)
      return []
    }
    return [{ objectId, payload }]
  })
  return { learned, edits, unresolved }
}
