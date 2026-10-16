export const S2_SECTIONS = [
  { id: 'definition', label: '一句话定义', title: 'Context Assembly 是什么？' },
  { id: 'why', label: 'Why', title: '为什么要理解上下文组装？' },
  { id: 'project', label: '原理 → 项目落地', title: '它如何落到 CRM Agent 中？' },
  { id: 'boundaries', label: '关键边界', title: 'Context 不等于什么？' },
  { id: 'case', label: 'Case', title: '一次上下文组装如何发生？' },
  { id: 'interview', label: 'Interview Lens', title: '面试中如何讲清 Context？' },
  { id: 'evidence', label: 'Evidence', title: '这些结论来自哪里？' },
] as const

export type S2SectionId = typeof S2_SECTIONS[number]['id']

function adjacentSection(current: S2SectionId, delta: number): S2SectionId {
  const index = S2_SECTIONS.findIndex(({ id }) => id === current)
  const next = Math.max(0, Math.min(S2_SECTIONS.length - 1, index + delta))
  return S2_SECTIONS[next]!.id
}

export const previousS2Section = (current: S2SectionId) => adjacentSection(current, -1)
export const nextS2Section = (current: S2SectionId) => adjacentSection(current, 1)
