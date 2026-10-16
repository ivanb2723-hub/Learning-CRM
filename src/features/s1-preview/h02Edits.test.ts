import { describe, expect, it } from 'vitest'
import { content } from '../../domain/content/content.ts'
import { createH02Text, exportH02Edits, readH02Edits, writeH02Edits } from './h02Edits.ts'

const card = content.knowledgeCards.find(({ id }) => id === 'card:h02-context')!

function storage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key) },
    setItem: (key, value) => { values.set(key, value) },
  }
}

describe('H02 local content edits', () => {
  it('uses the frozen canonical card as the initial reading text', () => {
    const text = createH02Text(card)
    expect(text.preview.definition).toBe(card.preview?.definition)
    expect(text.definition).toBe(card.definition)
    expect(text.boundaries.map(({ title }) => title)).toEqual(['Context ≠ Memory', 'Context ≠ System Prompt', 'Context ≠ Context Window'])
    expect(text.interviewLens).toHaveLength(5)
    expect(text.evidenceNotes).toHaveLength(7)
  })

  it('persists both preview and deep text through reload without mutating canonical content', () => {
    const local = storage()
    const text = createH02Text(card)
    text.preview.definition = '本地首屏修改'
    text.whyCourse = '本地深读修改'
    writeH02Edits(local, text, card)
    const loaded = readH02Edits(local, card)
    expect(loaded.preview.definition).toBe('本地首屏修改')
    expect(loaded.whyCourse).toBe('本地深读修改')
    expect(card.preview?.definition).not.toBe('本地首屏修改')
    expect(card.why.course).not.toBe('本地深读修改')
  })

  it('ignores stale or malformed saved data and exports a versioned, recoverable record', () => {
    const local = storage()
    local.setItem('crm-agent-explorer:h02-edits:v1', '{"version":1,"cardId":"wrong"}')
    expect(readH02Edits(local, card).definition).toBe(card.definition)
    const text = createH02Text(card)
    text.caseSummary = '修改后的案例'
    writeH02Edits(local, text, card)
    const exported = JSON.parse(exportH02Edits(local, card))
    expect(exported.version).toBe(1)
    expect(exported.cardId).toBe('card:h02-context')
    expect(exported.text.caseSummary).toBe('修改后的案例')
  })

})
