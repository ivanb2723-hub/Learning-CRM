import type { ContentBundle, KnowledgeCard } from '../../domain/content/schema.ts'

export function resolveS1Card(code: string, content: ContentBundle): { nodeId: string | null; card: KnowledgeCard | null } {
  const prefix = `${code.toLowerCase()}-`
  const node = content.nodes.find((candidate) => candidate.slug.startsWith(prefix))
  if (!node) return { nodeId: null, card: null }
  return {
    nodeId: node.id,
    card: content.knowledgeCards.find((candidate) => candidate.nodeId === node.id) ?? null,
  }
}

export function cardPreview(card: KnowledgeCard): { definition: string; mechanism: string; boundaries: KnowledgeCard['boundaries'] } {
  return {
    definition: card.preview?.definition ?? card.definition,
    mechanism: card.preview?.mechanism ?? card.mechanism,
    boundaries: card.boundaries,
  }
}
