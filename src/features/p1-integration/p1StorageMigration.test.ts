import { describe, expect, it } from 'vitest'
import { migrateP1Storage } from './p1StorageMigration.ts'

describe('P1 storage migration dry-run', () => {
  const source = {
    learned: { 'node:h02-context': true, 'node:unknown': true },
    edits: {
      'card:h02-context': { definition: 'user context edit' },
      'card:h05-loop': { definition: 'separate edit' },
    },
  }

  it('is idempotent, preserves an immutable backup and isolates edits per object', () => {
    const first = migrateP1Storage(source)
    const second = migrateP1Storage(first.output)
    expect(first.backup).toEqual(source)
    expect(first.output.learned['MIN-K03']).toBe(true)
    expect(first.output.edits['MIN-K03']).toEqual({ definition: 'user context edit' })
    expect(first.output.edits['MIN-K02']).toEqual({ definition: 'separate edit' })
    expect(second.output).toEqual(first.output)
  })

  it('reports unresolved IDs without deleting their legacy values', () => {
    const result = migrateP1Storage(source)
    expect(result.unresolved).toContain('node:unknown')
    expect(result.output.legacy).toEqual(source)
  })
})
