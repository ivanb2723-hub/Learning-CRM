import type { KnowledgeCard } from '../../domain/content/schema.ts'

const STORAGE_KEY = 'crm-agent-explorer:h02-edits:v1'

export type H02Text = {
  preview: { definition: string; mechanism: string }
  definition: string
  whyCourse: string
  whyProject: string
  mechanism: string
  projectUsage: string
  boundaries: { title: string; summary: string }[]
  caseSummary: string
  interviewLens: { question: string; answerFocus: string }[]
  evidenceNotes: string[]
}

export function createH02Text(card: KnowledgeCard): H02Text {
  return {
    preview: { definition: card.preview?.definition ?? card.definition, mechanism: card.preview?.mechanism ?? card.mechanism },
    definition: card.definition,
    whyCourse: card.why.course,
    whyProject: card.why.project,
    mechanism: card.mechanism,
    projectUsage: card.projectUsage,
    boundaries: card.boundaries.map(({ title, summary }) => ({ title, summary })),
    caseSummary: card.caseSummary,
    interviewLens: card.interviewLens.map(({ question, answerFocus }) => ({ question, answerFocus })),
    evidenceNotes: card.evidenceRefs.map(({ note }) => note ?? ''),
  }
}

export function validateH02Text(value: H02Text, card: KnowledgeCard): string | null {
  const required = [
    value.preview.definition, value.preview.mechanism, value.definition, value.whyCourse,
    value.whyProject, value.mechanism, value.projectUsage, value.caseSummary,
    ...value.boundaries.flatMap(({ title, summary }) => [title, summary]),
    ...value.interviewLens.flatMap(({ question, answerFocus }) => [question, answerFocus]),
  ]
  if (value.boundaries.length !== card.boundaries.length || value.interviewLens.length !== card.interviewLens.length || value.evidenceNotes.length !== card.evidenceRefs.length) return '内容结构与 H02 正式卡片不一致。'
  if (required.some((text) => typeof text !== 'string' || !text.trim())) return '正文不能留空。'
  if ([...required, ...value.evidenceNotes].some((text) => typeof text !== 'string' || text.length > 2000)) return '单项正文请控制在 2000 字以内。'
  return null
}

type SavedH02Edits = { version: 1; cardId: string; text: H02Text }

function isSaved(value: unknown, card: KnowledgeCard): value is SavedH02Edits {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<SavedH02Edits>
  if (record.version !== 1 || record.cardId !== card.id || !record.text || typeof record.text !== 'object') return false
  const text = record.text
  if (!text.preview || !Array.isArray(text.boundaries) || !Array.isArray(text.interviewLens) || !Array.isArray(text.evidenceNotes)) return false
  return validateH02Text(text, card) === null
}

export function readH02Edits(storage: Storage | undefined, card: KnowledgeCard): H02Text {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isSaved(parsed, card)) return parsed.text
    }
  } catch {
    // Unavailable or malformed storage falls back to the frozen card.
  }
  return createH02Text(card)
}

export function writeH02Edits(storage: Storage | undefined, text: H02Text, card: KnowledgeCard): boolean {
  if (validateH02Text(text, card)) return false
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ version: 1, cardId: card.id, text } satisfies SavedH02Edits))
    return Boolean(storage)
  } catch {
    return false
  }
}

export function exportH02Edits(storage: Storage | undefined, card: KnowledgeCard): string {
  return JSON.stringify({ version: 1, cardId: card.id, text: readH02Edits(storage, card) } satisfies SavedH02Edits, null, 2)
}
