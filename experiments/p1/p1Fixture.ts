export type Density = 'navigation' | 'short' | 'full'

export interface P1Object {
  id: string
  label: string
  kind: string
  density: Density
  facets: string[]
  sections?: Record<string, string>
  evidenceStatus?: 'source-confirmed' | 'configured-unverified' | 'teaching-only' | 'design-only'
}

export interface P1Relation {
  id: string
  from: string
  to: string
  type: string
  status?: 'source-confirmed' | 'design-only'
}

const fullContext = {
  definition: 'Context 是一次模型调用实际收到的运行时输入集合。',
  why: '它决定模型在当前回合可见什么、能遵循什么约束。',
  project: '系统规则、历史消息、工具描述、Skill 指引与检索结果在调用前被组织为输入。',
  boundaries: 'Context 不等于 Memory、System Prompt 或 Context Window。',
  case: 'CRM FAQ 请求在运行时加入技能指引、工具定义和检索结果。',
  interview: '说明来源、选择、组织、注入与预算边界。',
  evidence: '工程源码、配置、测试与课程资料，分别保留证据状态。',
}

export const p1Objects: P1Object[] = [
  { id: 'MIN-SYS01', label: 'CRM Agent System Overview', kind: 'navigation-aggregate', density: 'navigation', facets: ['MIN-F1', 'MIN-F2'] },
  { id: 'MIN-F1', label: 'Agent Runtime', kind: 'navigation-facet', density: 'navigation', facets: [] },
  { id: 'MIN-F2', label: 'Knowledge & Evaluation', kind: 'navigation-facet', density: 'navigation', facets: [] },
  { id: 'MIN-K01', label: 'Agent', kind: 'system-behavior', density: 'short', facets: ['MIN-F1'] },
  { id: 'MIN-K02', label: 'Agent Loop', kind: 'mechanism', density: 'short', facets: ['MIN-F1'] },
  { id: 'MIN-K03', label: 'Context', kind: 'transient-model-input', density: 'full', facets: ['MIN-F1'], sections: fullContext },
  { id: 'MIN-K04', label: 'State', kind: 'runtime-state', density: 'short', facets: ['MIN-F1'] },
  { id: 'MIN-K05', label: 'Checkpoint', kind: 'persistent-snapshot', density: 'short', facets: ['MIN-F1'], sections: { definition: 'Checkpoint 是某一时刻 State 的持久化快照。', boundaries: 'Checkpoint 不等于长期 Memory。' } },
  { id: 'MIN-K06', label: 'Tool', kind: 'capability-interface', density: 'short', facets: ['MIN-F1'] },
  { id: 'MIN-K07', label: 'RAG', kind: 'mechanism', density: 'short', facets: ['MIN-F2'] },
  { id: 'MIN-K08', label: 'Retrieval Step', kind: 'submechanism', density: 'short', facets: ['MIN-F2'] },
  { id: 'MIN-K09', label: 'FAQ Knowledge Resource', kind: 'data-resource', density: 'short', facets: ['MIN-F2'] },
  { id: 'MIN-K10', label: 'CRM FAQ Application', kind: 'project-application', density: 'short', facets: ['MIN-F1', 'MIN-F2'], evidenceStatus: 'configured-unverified' },
  { id: 'MIN-K11', label: 'Foundation Technology', kind: 'foundation-technology', density: 'short', facets: ['MIN-F2'] },
  { id: 'MIN-K12', label: 'Evaluation', kind: 'measurement-activity', density: 'short', facets: ['MIN-F2'], evidenceStatus: 'design-only' },
  { id: 'MIN-K13', label: 'Model', kind: 'model-category', density: 'short', facets: ['MIN-F1'] },
]

export const p1Relations: P1Relation[] = [
  { id: 'L01', from: 'MIN-K01', to: 'MIN-K13', type: 'uses' },
  { id: 'L02', from: 'MIN-K01', to: 'MIN-K02', type: 'runs_via' },
  { id: 'L03', from: 'MIN-K02', to: 'MIN-K04', type: 'reads_updates' },
  { id: 'L04', from: 'MIN-K03', to: 'MIN-K04', type: 'derived_from_selected_fields_of' },
  { id: 'L05', from: 'MIN-K13', to: 'MIN-K03', type: 'receives_as_model_input' },
  { id: 'L06', from: 'MIN-K02', to: 'MIN-K06', type: 'invokes_when_enabled' },
  { id: 'L07', from: 'MIN-K05', to: 'MIN-K04', type: 'snapshots' },
  { id: 'L08', from: 'MIN-K07', to: 'MIN-K09', type: 'retrieves_from' },
  { id: 'L09', from: 'MIN-K08', to: 'MIN-K07', type: 'part-of' },
  { id: 'L10', from: 'MIN-K10', to: 'MIN-K07', type: 'applies' },
  { id: 'L11', from: 'MIN-K08', to: 'MIN-K09', type: 'queries' },
  { id: 'L12', from: 'MIN-K12', to: 'MIN-K10', type: 'measures', status: 'design-only' },
  { id: 'L13', from: 'MIN-K06', to: 'MIN-K09', type: 'queries' },
]

export const p1Case = {
  id: 'Case-01',
  kind: 'teaching-walkthrough',
  objectIds: ['MIN-K01', 'MIN-K02', 'MIN-K03', 'MIN-K06', 'MIN-K07', 'MIN-K08', 'MIN-K09', 'MIN-K10', 'MIN-K12'],
}

export const p1Entries = [
  { id: 'map-context', objectId: 'MIN-K03', source: 'map' },
  { id: 'case-context', objectId: 'MIN-K03', source: 'case' },
  { id: 'interview-context', objectId: 'MIN-K03', source: 'interview' },
]
