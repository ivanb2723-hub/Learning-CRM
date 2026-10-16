import { describe, expect, it } from 'vitest'
import { buildReaderModel, dryRunMigration, projectS1, resolveEntries, validateSample } from './p1Adapter.ts'
import { p1Case, p1Entries, p1Objects, p1Relations } from './p1Fixture.ts'

describe('P1 minimal adapter acceptance tests', () => {
  it('preserves one canonical identity across map, case and interview entries', () => {
    const resolved = resolveEntries(p1Entries, p1Objects)
    expect(resolved.map(({ id }) => id)).toEqual(['MIN-K03', 'MIN-K03', 'MIN-K03'])
    expect(new Set(resolved).size).toBe(1)
  })

  it('validates all references and keeps application separate from hierarchy', () => {
    const result = validateSample(p1Objects, p1Relations)
    expect(result).toEqual({ valid: true, errors: [] })
    const projection = projectS1(p1Objects, p1Relations)
    expect(projection.hierarchyEdges).toEqual(['L09'])
    expect(projection.hierarchyEdges).not.toContain('L10')
  })

  it('builds full, short and navigation reader densities without empty seven-field padding', () => {
    const full = buildReaderModel(p1Objects.find(({ id }) => id === 'MIN-K03')!)
    const short = buildReaderModel(p1Objects.find(({ id }) => id === 'MIN-K05')!)
    const navigation = buildReaderModel(p1Objects.find(({ id }) => id === 'MIN-SYS01')!)
    expect([full.mode, full.sections.length]).toEqual(['seven-field', 7])
    expect([short.mode, short.sections.length]).toEqual(['short', 2])
    expect([navigation.mode, navigation.sections.length]).toEqual(['navigation', 0])
  })

  it('preserves Case references and evidence status without pretending it is a trace', () => {
    expect(p1Case.kind).toBe('teaching-walkthrough')
    const ids = new Set(p1Objects.map(({ id }) => id))
    expect(p1Case.objectIds.every((id) => ids.has(id))).toBe(true)
    expect(p1Objects.find(({ id }) => id === 'MIN-K10')?.evidenceStatus).toBe('configured-unverified')
  })

  it('dry-runs legacy progress, card edits and unresolved IDs in memory', () => {
    const result = dryRunMigration({
      learned: ['H02', 'H99'],
      edits: [{ nodeId: 'node:h02-context', payload: { definition: 'user edit' } }],
    })
    expect(result.learned).toEqual(['MIN-K03'])
    expect(result.edits).toEqual([{ objectId: 'MIN-K03', payload: { definition: 'user edit' } }])
    expect(result.unresolved).toEqual(['H99'])
  })
})
