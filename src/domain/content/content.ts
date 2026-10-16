import { authoringContent } from '../../../content/authoringContent.ts'
import { sourceIndex } from '../../../content/sourceIndex.ts'
import { validateKnowledgeSystem } from './validateContent.ts'

export const { content, sources } = validateKnowledgeSystem(
  authoringContent,
  sourceIndex,
)
