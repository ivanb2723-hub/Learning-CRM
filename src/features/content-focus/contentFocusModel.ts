import type { ContentBundle } from '../../domain/content/schema.ts'
import type { SourceIndex } from '../../domain/content/sourceSchema.ts'

export function buildDomainFocus(content: ContentBundle, domainId: string) {
  const domain = content.domains.find(({ id }) => id === domainId)
  if (!domain) throw new Error(`Unknown Domain ${domainId}`)

  return {
    domain,
    nodes: content.nodes
      .filter(({ primaryDomainId }) => primaryDomainId === domainId)
      .map((node) => ({
        node,
        card: content.knowledgeCards.find(({ nodeId }) => nodeId === node.id),
      })),
  }
}

export function buildNodeFocus(content: ContentBundle, sources: SourceIndex, nodeId: string) {
  const node = content.nodes.find(({ id }) => id === nodeId)
  if (!node) throw new Error(`Unknown Node ${nodeId}`)
  const card = content.knowledgeCards.find((candidate) => candidate.nodeId === node.id)
  const sourceById = new Map(sources.map((source) => [source.fragmentId, source]))

  return {
    node,
    card,
    evidence: card?.evidenceRefs.map((reference) => {
      const source = sourceById.get(reference.sourceFragmentId)
      if (!source) throw new Error(`Missing Source Fragment ${reference.sourceFragmentId}`)
      return { reference, source }
    }) ?? [],
  }
}
