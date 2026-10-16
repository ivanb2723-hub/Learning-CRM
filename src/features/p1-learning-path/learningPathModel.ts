import type { P1ReaderModel } from '../p1-integration/p1KnowledgeModel.ts'
import { topicByNumber } from './workSource.ts'

export type LearningMechanism = {
  id: string
  topicNumber: number
  question: string
  technology: { title: string; excerpt: string }
}

export type LearningAction = {
  id: string
  title: string
  processNote: string
  primaryTopicNumber: number
  mechanisms: LearningMechanism[]
}

// The six actions are one teaching probe. They are neither a required runtime trace nor a new inventory.
export const queryActions: LearningAction[] = [
  {
    id: 'identify', title: '确定查询对象', primaryTopicNumber: 6,
    processNote: '当前要查谁、查什么；不明确时应澄清。具体澄清行为未实测。',
    mechanisms: [
      { id: 'current-input', topicNumber: 6, question: '模型这次能看见哪些输入？', technology: { title: '模型调用输入', excerpt: '云帆已确认的输入来源包括：系统提示词、会话消息、可用工具描述、Skill 索引、加载的 Memory，以及实际调用后返回的工具结果。不同来源进入的条件不同，不能假定每轮全部加载。' } },
      { id: 'overall-roles', topicNumber: 1, question: '谁理解需求，谁负责取数据？', technology: { title: 'CRM 界面 → AgentRuntime', excerpt: '请求从 CRM 界面经 Next.js API 进入 Python AgentRuntime；DeepAgents 创建主 Agent，CRM Tool 再回到原 CRM 服务。' } },
    ],
  },
  {
    id: 'request', title: '提出 CRM 查询', primaryTopicNumber: 3,
    processNote: '模型提出调用某个查询 Tool，并给出参数。',
    mechanisms: [
      { id: 'tool-choice', topicNumber: 3, question: '请求怎样变成有名称和参数的能力调用？', technology: { title: 'CRM Tool 注册与可见性', excerpt: 'Python 工具把请求送到 Next.js 的工具接口。接口检查权限，原 CRM Service 按业务规则取数据。' } },
      { id: 'task-rule', topicNumber: 4, question: '客户分析任务规则从哪里来？', technology: { title: 'ManagedSkillsMiddleware / SKILL.md', excerpt: '模型能看见技能索引，具体 SKILL.md 正文按运行需要读取；不能说六份全文每次都进入模型输入。' } },
    ],
  },
  {
    id: 'tool', title: 'Tool 执行', primaryTopicNumber: 3,
    processNote: '应用执行工具请求，模型本身不直接访问任意数据库。',
    mechanisms: [
      { id: 'execution', topicNumber: 3, question: '谁真正执行模型提出的请求？', technology: { title: 'Python Tool → Next.js 工具接口', excerpt: '模型提出调用某个查询 Tool，并给出参数。Python 工具把请求送到 Next.js 的工具接口。' } },
      { id: 'runtime-loop', topicNumber: 5, question: '执行后为什么还会回到模型？', technology: { title: 'DeepAgents / LangGraph', excerpt: '在云帆，DeepAgents/LangGraph 有“模型—工具—模型”的执行路径。简单问题可以直接回答；需要客户事实时可以查询；拿到结果后可以继续调用，也可以结束。' } },
    ],
  },
  {
    id: 'service', title: 'CRM 权限与 Service', primaryTopicNumber: 11,
    processNote: '接口检查权限，原 CRM Service 按业务规则取数据。',
    mechanisms: [
      { id: 'permission', topicNumber: 11, question: '哪些客户资料允许当前用户读取？', technology: { title: 'CRM 角色与数据范围校验', excerpt: '云帆的 CRM 查询走角色与数据范围校验；新增、修改、删除等操作按配置触发人工审批。' } },
      { id: 'business-service', topicNumber: 3, question: '业务规则和数据访问分别在哪里？', technology: { title: 'CRM Service → Repository', excerpt: 'Service 是放业务规则的代码层；Repository 是连接数据存储的代码层。这里不是让模型直接拼任意 SQL 查库。' } },
    ],
  },
  {
    id: 'return', title: '结果回传', primaryTopicNumber: 6,
    processNote: '查询结果返回运行图，供后续模型调用使用。',
    mechanisms: [
      { id: 'result-context', topicNumber: 6, question: '结果怎样成为这次回答的依据？', technology: { title: 'ToolMessage → 后续模型输入', excerpt: '查询结果回来后，只有进入模型输入，才能成为本次回答的直接依据。数据库里存在某条记录，不代表模型已经看见它。' } },
      { id: 'run-state', topicNumber: 7, question: '运行过程保存了什么？', technology: { title: 'State / Checkpoint', excerpt: '任务运行更新 State；Checkpoint 保存线程状态；继续会话或审批恢复时按线程读取。Memory 可以被加载到模型输入，但它不等于状态快照。' } },
    ],
  },
  {
    id: 'decide', title: '继续查询或结束', primaryTopicNumber: 5,
    processNote: '拿到结果后，模型再决定：继续取资料，还是已经可以回答。',
    mechanisms: [
      { id: 'loop', topicNumber: 5, question: '为什么可能再次查询？', technology: { title: '模型—工具—模型循环', excerpt: '简单问题可以直接回答；需要客户事实时可以查询；拿到结果后可以继续调用，也可以结束。' } },
      { id: 'failure-boundary', topicNumber: 11, question: '遇到失败或权限不足怎么办？', technology: { title: '权限与异常边界', excerpt: '查询失败时说明缺少什么，再判断能否安全重试；没有权限时拒绝该数据路径，不换方式绕过。' } },
    ],
  },
]

export function readerForWorkTopic(topicNumber: number): P1ReaderModel | null {
  const topic = topicByNumber(topicNumber)
  if (!topic) return null
  return {
    objectId: topic.id,
    code: `主题 ${topic.number}`,
    title: topic.title,
    subtitle: 'Work 完整正文原稿',
    mode: 'short',
    sections: [{ id: 'work-full', label: '完整正文', title: topic.title, body: topic.lead, markdown: topic.markdown }],
  }
}
