import { z } from 'zod'

import { SourceFragmentIdSchema, SourceLayerSchema } from './sourceSchema.ts'

function entityId(prefix: string) {
  return z
    .string()
    .regex(
      new RegExp(`^${prefix}:[a-z0-9]+(?:-[a-z0-9]+)*$`),
      `Expected a ${prefix}:kebab-case identifier`,
    )
}

export const DomainIdSchema = entityId('domain')
export const NodeIdSchema = entityId('node')
export const RelationIdSchema = entityId('relation')
export const CaseIdSchema = entityId('case')
export const KnowledgeCardIdSchema = entityId('card')
export const InterviewQuestionIdSchema = entityId('question')
export const EvidenceIdSchema = entityId('evidence')

export const BoundaryRevisionSchema = z
  .object({
    original: z.string().trim().min(1).max(500),
    revised: z.string().trim().min(1).max(500),
    reason: z.string().trim().min(1).max(500),
    impact: z.string().trim().min(1).max(500),
  })
  .strict()

export const DomainSchema = z
  .object({
    id: DomainIdSchema,
    name: z.string().trim().min(1).max(120),
    kind: z.enum(['core', 'overlay']),
    description: z.string().trim().min(1).max(500),
    order: z.number().int().nonnegative(),
    boundaryRevision: BoundaryRevisionSchema.optional(),
  })
  .strict()

export const NodeSchema = z
  .object({
    id: NodeIdSchema,
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1).max(120),
    kind: z.enum([
      'business',
      'runtime',
      'skill',
      'tool',
      'data',
      'state',
      'ai-resource',
      'external',
      'application',
      'governance',
      'evaluation',
    ]),
    primaryDomainId: DomainIdSchema,
    summary: z.string().trim().min(1).max(500),
    weight: z.enum(['Core', 'Standard', 'Reference']).optional(),
    boundaryRevision: BoundaryRevisionSchema.optional(),
  })
  .strict()

export const RelationSchema = z
  .object({
    id: RelationIdSchema,
    sourceNodeId: NodeIdSchema,
    targetNodeId: NodeIdSchema,
    type: z.enum([
      'flows-to',
      'invokes',
      'uses',
      'depends-on',
      'reads',
      'writes',
      'governs',
      'evaluates',
      'supports',
    ]),
    label: z.string().trim().min(1).max(120),
    boundaryRevision: BoundaryRevisionSchema.optional(),
  })
  .strict()

const CaseStepSchema = z
  .object({
    nodeId: NodeIdSchema,
    viaRelationId: RelationIdSchema.optional(),
  })
  .strict()

export const CaseSchema = z
  .object({
    id: CaseIdSchema,
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    steps: z.array(CaseStepSchema).min(2),
  })
  .strict()

export const KnowledgeCardSchema = z
  .object({
    id: KnowledgeCardIdSchema,
    nodeId: NodeIdSchema,
    title: z.string().trim().min(1).max(120),
    definition: z.string().trim().min(1).max(500),
    preview: z.object({
      definition: z.string().trim().min(1).max(500),
      mechanism: z.string().trim().min(1).max(500),
    }).strict().optional(),
    reviewStatus: z.enum(['draft', 'lint-passed', 'reviewed', 'frozen']),
    claims: z.array(
      z
        .object({
          claimId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          text: z.string().trim().min(1).max(500),
          sourceLayer: SourceLayerSchema,
          sourceFragmentIds: z.array(SourceFragmentIdSchema).min(1).max(8),
        })
        .strict(),
    ),
    why: z
      .object({
        course: z.string().trim().min(1).max(500),
        industry: z.string().trim().min(1).max(500).optional(),
        project: z.string().trim().min(1).max(500),
      })
      .strict(),
    mechanism: z.string().trim().min(1).max(1_000),
    projectUsage: z.string().trim().min(1).max(700),
    boundaries: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(120),
            status: z.enum(['frozen', 'candidate', 'revised', 'normal']),
            summary: z.string().trim().min(1).max(500),
            sourceFragmentIds: z.array(SourceFragmentIdSchema).max(8),
            boundaryRevision: BoundaryRevisionSchema.optional(),
          })
          .strict(),
      )
      .max(3),
    caseSummary: z.string().trim().min(1).max(700),
    interviewLens: z.array(
      z
        .object({
          question: z.string().trim().min(1).max(300),
          answerFocus: z.string().trim().min(1).max(700),
          sourceFragmentIds: z.array(SourceFragmentIdSchema).max(8),
        })
        .strict(),
    ),
    evidenceRefs: z.array(
      z
        .object({
          sourceFragmentId: SourceFragmentIdSchema,
          sourceLayer: SourceLayerSchema,
          note: z.string().trim().min(1).max(500).optional(),
        })
        .strict(),
    ),
    relatedNodeIds: z.array(NodeIdSchema).max(12),
  })
  .strict()

export const InterviewQuestionSchema = z
  .object({
    id: InterviewQuestionIdSchema,
    nodeId: NodeIdSchema,
    question: z.string().trim().min(1).max(300),
    answerOutline: z.array(z.string().trim().min(1).max(300)).min(1).max(8),
  })
  .strict()

const EvidenceTargetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('node'), id: NodeIdSchema }).strict(),
  z.object({ type: z.literal('case'), id: CaseIdSchema }).strict(),
  z
    .object({ type: z.literal('question'), id: InterviewQuestionIdSchema })
    .strict(),
])

export const EvidenceSchema = z
  .object({
    id: EvidenceIdSchema,
    target: EvidenceTargetSchema,
    sourceFragmentId: SourceFragmentIdSchema,
    sourceLayer: SourceLayerSchema,
    note: z.string().trim().min(1).max(500).optional(),
  })
  .strict()

export const ContentBundleSchema = z
  .object({
    domains: z.array(DomainSchema),
    nodes: z.array(NodeSchema),
    relations: z.array(RelationSchema),
    cases: z.array(CaseSchema),
    knowledgeCards: z.array(KnowledgeCardSchema),
    interviewQuestions: z.array(InterviewQuestionSchema),
    evidence: z.array(EvidenceSchema),
  })
  .strict()

export type Domain = z.infer<typeof DomainSchema>
export type SystemNode = z.infer<typeof NodeSchema>
export type Relation = z.infer<typeof RelationSchema>
export type SystemCase = z.infer<typeof CaseSchema>
export type KnowledgeCard = z.infer<typeof KnowledgeCardSchema>
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>
export type Evidence = z.infer<typeof EvidenceSchema>
export type ContentBundle = z.infer<typeof ContentBundleSchema>
