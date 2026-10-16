import { z } from 'zod'

export const SourceLayerSchema = z.enum([
  'course',
  'project',
  'industry',
  'inference',
  'jd',
  'interview',
])

export const SourceIdSchema = z
  .string()
  .regex(/^source:[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const SourceFragmentIdSchema = z
  .string()
  .regex(/^fragment:[a-z0-9]+(?:-[a-z0-9]+)*$/)

const SourceNodeIdSchema = z
  .string()
  .regex(/^node:[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const SourceFragmentSchema = z
  .object({
    sourceId: SourceIdSchema,
    fragmentId: SourceFragmentIdSchema,
    sourceType: SourceLayerSchema,
    title: z.string().trim().min(1).max(200),
    location: z.string().trim().min(1).max(500),
    text: z.string().trim().min(1).max(2_000),
    relatedNodeIds: z.array(SourceNodeIdSchema).min(1).max(12),
    notes: z.string().trim().min(1).max(500).optional(),
  })
  .strict()

export const SourceIndexSchema = z.array(SourceFragmentSchema)

export type SourceLayer = z.infer<typeof SourceLayerSchema>
export type SourceFragment = z.infer<typeof SourceFragmentSchema>
export type SourceIndex = z.infer<typeof SourceIndexSchema>
