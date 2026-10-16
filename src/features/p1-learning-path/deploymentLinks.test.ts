import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('P1 preview links under a repository subpath', () => {
  it('keeps the learning path and knowledge map links on the current pathname', () => {
    const pathSource = readFileSync(fileURLToPath(new URL('./P1LearningPath.tsx', import.meta.url)), 'utf8')
    const mapSource = readFileSync(fileURLToPath(new URL('../s1-preview/S1Preview.tsx', import.meta.url)), 'utf8')

    expect(pathSource).toContain('href="?view=s1&p1=1"')
    expect(mapSource).toContain('href="?p1Path=1"')
  })
})
