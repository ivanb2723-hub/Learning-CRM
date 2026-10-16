import type { S1DomainId, S1InventoryNode } from '../s1-preview/s1Inventory.ts'

export type P1ObjectType = 'navigation-aggregate' | 'system-behavior' | 'mechanism' | 'transient-model-input' | 'runtime-state' | 'persistent-snapshot' | 'capability-interface' | 'submechanism' | 'data-resource' | 'project-application' | 'foundation-technology' | 'measurement-activity' | 'model-category'
export type EvidenceStatus = 'source-confirmed' | 'configured-unverified' | 'not-reproduced' | 'design-only'
export type P1ReaderMode = 'seven-field' | 'short' | 'navigation'

export type P1Section = { id: string; label: string; title: string; body: string; bullets?: string[]; flow?: string[]; markdown?: string }
export type P1ReaderModel = { objectId: string; code: string; title: string; subtitle: string; mode: P1ReaderMode; sections: P1Section[] }
export type P1Object = {
  id: string
  title: string
  subtitle: string
  type: P1ObjectType
  domainId: S1DomainId
  density: P1ReaderMode | 'preview' | 'pending'
  parentId?: string
  preview?: { definition: string; mechanism: string; boundaries: string[] }
  evidenceStatus?: EvidenceStatus
}

export const p1Objects: P1Object[] = [
  { id: 'MIN-SYS01', title: 'CRM Agent 学习总览', subtitle: 'System Overview', type: 'navigation-aggregate', domainId: 'business', density: 'navigation', preview: { definition: '从请求、模型与能力、业务与知识数据、回答到检查的学习导览。', mechanism: '只组织入口，不生成技术父子关系，也不强制创建七字段正文。', boundaries: ['导航位置 ≠ 技术父子关系'] } },
  { id: 'MIN-K01', title: 'LLM Agent', subtitle: '系统 / 行为模式', type: 'system-behavior', domainId: 'harness', density: 'preview' },
  { id: 'MIN-K02', title: 'Agent Loop', subtitle: '运行机制', type: 'mechanism', domainId: 'harness', density: 'preview' },
  { id: 'MIN-K03', title: '模型调用 Context', subtitle: '瞬时模型输入 / 信息角色', type: 'transient-model-input', domainId: 'harness', density: 'seven-field', preview: { definition: '一次模型调用实际收到的指令、消息、可用工具描述及相关信息。', mechanism: '任务与规则＋选中的会话信息＋相关 Tool/FAQ 结果 → 选择、裁剪、组织 → 模型调用。', boundaries: ['Context ≠ 全部 State', 'Context ≠ 长期 Memory', 'Context ≠ System Prompt / Context Window'] } },
  { id: 'MIN-K04', title: 'State', subtitle: '运行数据状态', type: 'runtime-state', domainId: 'harness', density: 'preview' },
  { id: 'MIN-K05', title: 'Checkpoint', subtitle: '持久化记录 / 机制', type: 'persistent-snapshot', domainId: 'harness', density: 'short', preview: { definition: '在 LangGraph 线程运行中保存 State 快照，支持暂停与后续恢复等能力。', mechanism: 'State 经 snapshots 关系形成 Checkpoint；课程覆盖与项目恢复证据需分开。', boundaries: ['Checkpoint ≠ 长期 Memory', '存在快照 ≠ 任意故障均恢复成功'] } },
  { id: 'MIN-K06', title: 'Tool', subtitle: '能力接口', type: 'capability-interface', domainId: 'capability', density: 'preview' },
  { id: 'MIN-K07', title: 'RAG', subtitle: '整体机制', type: 'mechanism', domainId: 'capability', density: 'preview', preview: { definition: '利用外部检索材料辅助生成结果的机制。', mechanism: '检索知识资源 → 返回相关材料 → 带材料生成。', boundaries: ['本地组件证据 ≠ 回答忠实度已验证'] } },
  { id: 'MIN-K08', title: '相关条目检索', subtitle: '子机制 / 检索步骤', type: 'submechanism', domainId: 'capability', density: 'pending' },
  { id: 'MIN-K09', title: 'Knowledge Base', subtitle: '数据资源', type: 'data-resource', domainId: 'resources', density: 'preview' },
  { id: 'MIN-K10', title: 'CRM 课程 FAQ 问答路径', subtitle: '项目能力 / 实例', type: 'project-application', domainId: 'business', density: 'preview', evidenceStatus: 'configured-unverified', preview: { definition: '在 CRM Agent 中按 Skill 指引检索 FAQ，再依据检索证据组织答复的项目应用。', mechanism: 'product-faq-answer → knowledge_faq_search → FAQ 索引 → 组织回答。', boundaries: ['教学走查 ≠ 已复现真实 Trace', '组件存在 ≠ 整链质量已验证'] } },
  { id: 'MIN-K11', title: 'SQL', subtitle: '非 Agent 专属基础技术', type: 'foundation-technology', domainId: 'resources', density: 'preview' },
  { id: 'MIN-K12', title: 'Evaluation', subtitle: '测量活动', type: 'measurement-activity', domainId: 'capability', density: 'preview', evidenceStatus: 'design-only' },
  { id: 'MIN-K13', title: 'LLM', subtitle: '模型类别', type: 'model-category', domainId: 'resources', density: 'preview' },
]

export type P1Relation = { id: string; from: string; to: string; type: string; category: 'operational' | 'composition' | 'application' | 'measurement'; status?: EvidenceStatus }
export const p1Relations: P1Relation[] = [
  { id: 'L01', from: 'MIN-K01', to: 'MIN-K13', type: 'uses', category: 'operational' },
  { id: 'L02', from: 'MIN-K01', to: 'MIN-K02', type: 'runs_via', category: 'operational' },
  { id: 'L03', from: 'MIN-K02', to: 'MIN-K04', type: 'reads_updates', category: 'operational' },
  { id: 'L04', from: 'MIN-K03', to: 'MIN-K04', type: 'derived_from_selected_fields_of', category: 'operational' },
  { id: 'L05', from: 'MIN-K13', to: 'MIN-K03', type: 'receives_as_model_input', category: 'operational' },
  { id: 'L06', from: 'MIN-K02', to: 'MIN-K06', type: 'invokes_when_enabled', category: 'operational' },
  { id: 'L07', from: 'MIN-K05', to: 'MIN-K04', type: 'snapshots', category: 'operational' },
  { id: 'L08', from: 'MIN-K07', to: 'MIN-K09', type: 'retrieves_from', category: 'operational' },
  { id: 'L09', from: 'MIN-K08', to: 'MIN-K07', type: 'part-of', category: 'composition' },
  { id: 'L10', from: 'MIN-K10', to: 'MIN-K07', type: 'applies', category: 'application', status: 'configured-unverified' },
  { id: 'L11', from: 'MIN-K08', to: 'MIN-K09', type: 'queries', category: 'operational' },
  { id: 'L12', from: 'MIN-K12', to: 'MIN-K10', type: 'measures', category: 'measurement', status: 'design-only' },
  { id: 'L13', from: 'MIN-K06', to: 'MIN-K09', type: 'queries', category: 'operational', status: 'not-reproduced' },
]

export const p1Inventory: S1InventoryNode[] = p1Objects.map(({ id, title, domainId }) => ({ id, name: title, domainId }))

const contextSections: P1Section[] = [
  { id: 'definition', label: '一句话定义', title: '模型调用 Context 是什么？', body: '模型调用 Context 是模型在这一次调用实际可见的指令、消息、工具描述和相关材料；下一次调用的内容可以不同。此处特指 model context，不把框架的 runtime context 配置字段混为一谈。' },
  { id: 'why', label: 'Why', title: '为什么需要管理 Context？', body: 'Agent 的状态、知识库和业务数据可能远多于模型这次需要的材料。选择相关信息能降低遗漏关键依据、超出输入容量、泄露无关数据与不必要成本的风险；效果是否改善需用任务和成本指标验证，不能由概念本身保证。' },
  { id: 'project', label: '原理 → 项目落地', title: 'Context 如何进入模型调用？', body: '任务/规则＋选中的会话信息＋相关 Tool/FAQ 结果 → 选择、裁剪、组织 → 模型调用。这是课堂机制和专业资料所支持的模型输入边界。CRM 审计可证上下文展示与模型配置；具体某次调用选择了哪些 FAQ 片段、顺序、裁剪策略没有现有审计证据，需按请求、中间件和模型事件核验。', flow: ['任务 / 规则', '选中的会话信息', 'Tool / FAQ 结果', '选择、裁剪、组织', '模型调用'] },
  { id: 'boundaries', label: '关键边界', title: 'Context 不等于什么？', body: '这些对象可能发生信息流动，但不应被合并成同一概念。', bullets: ['Context ≠ 全部 State；State 可包含未送入模型的 Todo 或结果。', 'Context ≠ 长期 Memory；记忆可经检索后被选入一次 Context。', 'Context ≠ 单一 System Prompt，也不等于标称 Context Window 大小。', '课件“运行时 Context”与框架 runtime.context 专有配置 API 需分别注明。'] },
  { id: 'case', label: 'Case', title: 'Case-01 中的 Context', body: 'Case-01 第 4 步只问哪些 FAQ 证据进入本次输入、哪些未进入；案例展示过程，不在这里复制五步轨迹。没有真实请求时只显示“待核”字段，不造一份模型输入。' },
  { id: 'interview', label: 'Interview Lens', title: '如何定位长对话答非所问？', body: '练习问题来自未独立核实的个人分享。回答时先区分检索没找到、找到了但未送入、被截断或排序淹没、模型仍误用信息；提出可观测证据与对照验证，不能声称云帆已完成这些诊断。' },
  { id: 'evidence', label: 'Evidence', title: '来源与证据边界', body: '课程 QC005/QC006；专业资料 E-CTX；项目审计 P-ENG §5.1、§5.4；岗位练习 XHS-015。项目真实组装与效果仍待原项目 Codex 核验。', bullets: ['DeepAgents 0.7.7 默认具有 SummarizationMiddleware，但未验证某次 CRM 会话触发摘要。', 'FAQ Skill、Tool、sqlite-vec 与 30 条 FAQ/向量有源码及本地数据证据。', 'FAQ 真实模型整链与回答质量未完整复现。', '项目没有正式 Agent 任务级评测或 RAG 效果评测体系。'] },
]

const checkpointSections: P1Section[] = [
  { id: 'what', label: '是什么', title: 'Checkpoint 是什么？', body: '在 LangGraph 线程运行中保存 State 快照，支持暂停与后续恢复等能力。' },
  { id: 'relations', label: '与谁有关', title: 'Checkpoint 与 State', body: 'K04 State 经 L07 被保存；CRM 本地审计中，SqliteSaver 与 checkpoint 表具有快照级证据。' },
  { id: 'limits', label: '不能推断', title: '证据边界', body: '课件 p16 只讲 Run State；数据库有快照不等于任何故障场景都恢复成功，本轮未复现。' },
]

export function readerForObject(id: string): P1ReaderModel | null {
  const object = p1Objects.find((candidate) => candidate.id === id)
  if (!object) return null
  if (id === 'MIN-K03') return { objectId: id, code: id, title: object.title, subtitle: object.subtitle, mode: 'seven-field', sections: contextSections }
  if (id === 'MIN-K05') return { objectId: id, code: id, title: object.title, subtitle: object.subtitle, mode: 'short', sections: checkpointSections }
  if (object.density === 'navigation') return { objectId: id, code: id, title: object.title, subtitle: object.subtitle, mode: 'navigation', sections: [] }
  return null
}

export const p1Case = {
  id: 'Case-01',
  title: 'CRM FAQ 教学走查',
  kind: 'teaching-walkthrough' as const,
  steps: [
    { id: 'case-01-step-1', label: '理解请求和范围', objectIds: ['MIN-K01', 'MIN-K03', 'MIN-K13'], evidenceStatus: 'not-reproduced' as EvidenceStatus },
    { id: 'case-01-step-2', label: '发现并调用检索能力', objectIds: ['MIN-K02', 'MIN-K06', 'MIN-K10'], evidenceStatus: 'configured-unverified' as EvidenceStatus },
    { id: 'case-01-step-3', label: '找 FAQ 条目', objectIds: ['MIN-K07', 'MIN-K08', 'MIN-K09'], evidenceStatus: 'configured-unverified' as EvidenceStatus },
    { id: 'case-01-step-4', label: '带证据生成回复', objectIds: ['MIN-K03', 'MIN-K13', 'MIN-K07'], evidenceStatus: 'not-reproduced' as EvidenceStatus },
    { id: 'case-01-step-5', label: '检查效果', objectIds: ['MIN-K12'], evidenceStatus: 'design-only' as EvidenceStatus },
  ],
}

export function objectById(id: string) { return p1Objects.find((object) => object.id === id) ?? null }
