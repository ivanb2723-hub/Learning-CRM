import { ContentBundleSchema, type ContentBundle } from './schema.ts'
import {
  SourceIndexSchema,
  type SourceFragment,
  type SourceIndex,
} from './sourceSchema.ts'

const protectedInventoryOwnership = {
  'node:b09-proactive-agent': 'domain:business',
  'node:h02-context': 'domain:harness',
  'node:h04-planning-todo': 'domain:harness',
  'node:h06-tool-execution': 'domain:harness',
  'node:h08-state-checkpoint': 'domain:harness',
  'node:h09-memory': 'domain:harness',
  'node:c10-knowledge-retrieval-tool': 'domain:capability',
  'node:c16-rag': 'domain:capability',
  'node:r02-model': 'domain:resources',
  'node:r08-long-term-memory-store': 'domain:resources',
  'node:r09-state-checkpoint-store': 'domain:resources',
  'node:r10-mcp': 'domain:resources',
} as const

const frozenBoundaryNames = new Set([
  'Tool ≠ Skill',
  'Capability ≠ Tool Execution',
  'Context ≠ Memory',
  'Context ≠ System Prompt',
  'Context ≠ Context Window',
])

function assertUnique(
  entityName: string,
  values: readonly string[],
  fieldName = 'id',
) {
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${entityName} ${fieldName}: ${value}`)
    }
    seen.add(value)
  }
}

export function validateContent(input: unknown): ContentBundle {
  const content = ContentBundleSchema.parse(input)

  assertUnique('Domain', content.domains.map(({ id }) => id))
  assertUnique('Node', content.nodes.map(({ id }) => id))
  assertUnique('Node', content.nodes.map(({ slug }) => slug), 'slug')
  assertUnique('Relation', content.relations.map(({ id }) => id))
  assertUnique('Case', content.cases.map(({ id }) => id))
  assertUnique('KnowledgeCard', content.knowledgeCards.map(({ id }) => id))
  assertUnique(
    'InterviewQuestion',
    content.interviewQuestions.map(({ id }) => id),
  )
  assertUnique('Evidence', content.evidence.map(({ id }) => id))

  const coreDomainCount = content.domains.filter(({ kind }) => kind === 'core').length
  const overlayDomainCount = content.domains.filter(
    ({ kind }) => kind === 'overlay',
  ).length
  if (coreDomainCount !== 4 || overlayDomainCount !== 1) {
    throw new Error('Content must define exactly 4 core Domains and 1 overlay Domain')
  }

  const domainIds = new Set(content.domains.map(({ id }) => id))
  const nodeIds = new Set(content.nodes.map(({ id }) => id))
  const relationById = new Map(content.relations.map((relation) => [relation.id, relation]))
  const caseIds = new Set(content.cases.map(({ id }) => id))
  const questionIds = new Set(content.interviewQuestions.map(({ id }) => id))

  for (const node of content.nodes) {
    if (!domainIds.has(node.primaryDomainId)) {
      throw new Error(
        `Node ${node.id} references missing primary Domain ${node.primaryDomainId}`,
      )
    }

    const protectedDomain =
      protectedInventoryOwnership[
        node.id as keyof typeof protectedInventoryOwnership
      ]
    if (protectedDomain !== undefined && node.primaryDomainId !== protectedDomain) {
      throw new Error(
        `Inventory 0.2 requires ${node.id} to belong to ${protectedDomain}`,
      )
    }
    if (node.id === 'node:c13-service-info-tool' || node.name === 'Service Info Tool') {
      throw new Error('C13 Service Info Tool cannot be a canonical Node')
    }
  }

  for (const relation of content.relations) {
    if (!nodeIds.has(relation.sourceNodeId)) {
      throw new Error(
        `Relation ${relation.id} references missing source Node ${relation.sourceNodeId}`,
      )
    }
    if (!nodeIds.has(relation.targetNodeId)) {
      throw new Error(
        `Relation ${relation.id} references missing target Node ${relation.targetNodeId}`,
      )
    }
    if (relation.sourceNodeId === relation.targetNodeId) {
      throw new Error(`Relation ${relation.id} cannot connect a Node to itself`)
    }
  }

  for (const systemCase of content.cases) {
    systemCase.steps.forEach((step, index) => {
      if (!nodeIds.has(step.nodeId)) {
        throw new Error(`Case ${systemCase.id} references missing Node ${step.nodeId}`)
      }

      if (index === 0) {
        if (step.viaRelationId !== undefined) {
          throw new Error(`Case ${systemCase.id} first step cannot have a Relation`)
        }
        return
      }

      if (step.viaRelationId === undefined) {
        throw new Error(`Case ${systemCase.id} step ${index + 1} requires a Relation`)
      }

      const relation = relationById.get(step.viaRelationId)
      if (relation === undefined) {
        throw new Error(
          `Case ${systemCase.id} references missing Relation ${step.viaRelationId}`,
        )
      }

      const previousNodeId = systemCase.steps[index - 1]?.nodeId
      if (
        relation.sourceNodeId !== previousNodeId ||
        relation.targetNodeId !== step.nodeId
      ) {
        throw new Error(
          `Case ${systemCase.id} Relation ${relation.id} does not connect ${previousNodeId} to ${step.nodeId}`,
        )
      }
    })
  }

  for (const card of content.knowledgeCards) {
    if (!nodeIds.has(card.nodeId)) {
      throw new Error(`KnowledgeCard ${card.id} references missing Node ${card.nodeId}`)
    }
    assertUnique(`KnowledgeCard ${card.id} related Node`, card.relatedNodeIds)
    for (const relatedNodeId of card.relatedNodeIds) {
      if (!nodeIds.has(relatedNodeId)) {
        throw new Error(
          `KnowledgeCard ${card.id} references missing related Node ${relatedNodeId}`,
        )
      }
    }
    assertUnique(`KnowledgeCard ${card.id} Claim`, card.claims.map(({ claimId }) => claimId), 'claimId')
    for (const boundary of card.boundaries) {
      if (boundary.status === 'frozen' && !frozenBoundaryNames.has(boundary.title)) {
        throw new Error(
          `KnowledgeCard ${card.id} uses an unknown frozen boundary: ${boundary.title}`,
        )
      }
      if (boundary.status === 'revised' && boundary.boundaryRevision === undefined) {
        throw new Error(
          `KnowledgeCard ${card.id} revised boundary ${boundary.title} requires Boundary Revision`,
        )
      }
    }
  }

  for (const question of content.interviewQuestions) {
    if (!nodeIds.has(question.nodeId)) {
      throw new Error(
        `InterviewQuestion ${question.id} references missing Node ${question.nodeId}`,
      )
    }
  }

  for (const item of content.evidence) {
    const targetExists =
      item.target.type === 'node'
        ? nodeIds.has(item.target.id)
        : item.target.type === 'case'
          ? caseIds.has(item.target.id)
          : questionIds.has(item.target.id)

    if (!targetExists) {
      throw new Error(
        `Evidence ${item.id} references missing ${item.target.type} ${item.target.id}`,
      )
    }
  }

  return content
}

function resolveFragment(
  fragmentId: string,
  fragmentById: ReadonlyMap<string, SourceFragment>,
  owner: string,
) {
  const fragment = fragmentById.get(fragmentId)
  if (fragment === undefined) {
    throw new Error(`${owner} references missing Source Fragment ${fragmentId}`)
  }
  return fragment
}

export function validateKnowledgeSystem(
  contentInput: unknown,
  sourceInput: unknown,
): { content: ContentBundle; sources: SourceIndex } {
  const content = validateContent(contentInput)
  const sources = SourceIndexSchema.parse(sourceInput)

  assertUnique('Source Fragment', sources.map(({ fragmentId }) => fragmentId))
  const nodeIds = new Set(content.nodes.map(({ id }) => id))
  const fragmentById = new Map(
    sources.map((fragment) => [fragment.fragmentId, fragment]),
  )

  for (const source of sources) {
    for (const nodeId of source.relatedNodeIds) {
      if (!nodeIds.has(nodeId)) {
        throw new Error(
          `Source Fragment ${source.fragmentId} references missing Node ${nodeId}`,
        )
      }
    }
  }

  for (const card of content.knowledgeCards) {
    for (const claim of card.claims) {
      for (const fragmentId of claim.sourceFragmentIds) {
        const fragment = resolveFragment(fragmentId, fragmentById, `Claim ${claim.claimId}`)
        if (fragment.sourceType !== claim.sourceLayer) {
          throw new Error(
            `Claim ${claim.claimId} source layer does not match Source Fragment ${fragmentId}`,
          )
        }
      }
    }

    for (const boundary of card.boundaries) {
      for (const fragmentId of boundary.sourceFragmentIds) {
        resolveFragment(fragmentId, fragmentById, `Boundary ${boundary.title}`)
      }
    }

    for (const lens of card.interviewLens) {
      for (const fragmentId of lens.sourceFragmentIds) {
        resolveFragment(fragmentId, fragmentById, `Interview Lens ${lens.question}`)
      }
    }

    for (const evidence of card.evidenceRefs) {
      const fragment = resolveFragment(
        evidence.sourceFragmentId,
        fragmentById,
        `KnowledgeCard ${card.id} evidence`,
      )
      if (fragment.sourceType !== evidence.sourceLayer) {
        throw new Error(
          `KnowledgeCard ${card.id} evidence source layer does not match ${evidence.sourceFragmentId}`,
        )
      }
    }

    const definitionLayers = new Set(card.evidenceRefs.map(({ sourceLayer }) => sourceLayer))
    if (
      definitionLayers.size > 0 &&
      [...definitionLayers].every((layer) => layer === 'jd' || layer === 'interview')
    ) {
      throw new Error(
        `KnowledgeCard ${card.id} cannot base its definition only on JD or interview sources`,
      )
    }
  }

  for (const evidence of content.evidence) {
    const fragment = resolveFragment(
      evidence.sourceFragmentId,
      fragmentById,
      `Evidence ${evidence.id}`,
    )
    if (fragment.sourceType !== evidence.sourceLayer) {
      throw new Error(
        `Evidence ${evidence.id} source layer does not match ${evidence.sourceFragmentId}`,
      )
    }
  }

  return { content, sources }
}
