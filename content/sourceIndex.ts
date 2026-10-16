import type { SourceIndex } from '../src/domain/content/sourceSchema.ts'

export const sourceIndex = [
  {
    sourceId: 'source:course-harness-lower', fragmentId: 'fragment:course-h02-context', sourceType: 'course',
    title: 'Harness入门（下）：Context 上下文管理',
    location: 'local-source://Desktop/云帆CRM资料汇总/课程基础知识点ppt/Harness入门（下）.pptx#slide=4',
    text: '每轮调用前，Harness 将系统提示词、对话历史、工具定义、技能索引等所需信息选择、裁剪、排序、注入为运行时上下文，并发送至 Model API。',
    relatedNodeIds: ['node:h02-context'], notes: '课件第 4 页图片文字；只记录图中明确的信息。',
  },
  {
    sourceId: 'source:course-harness-lower', fragmentId: 'fragment:course-h02-memory', sourceType: 'course',
    title: 'Harness入门（下）：Memory 记忆',
    location: 'local-source://Desktop/云帆CRM资料汇总/课程基础知识点ppt/Harness入门（下）.pptx#slide=7',
    text: 'Memory 保存重要信息，需用时经过检索、过滤、排序后注入 Context；Memory 不是完整历史回放。',
    relatedNodeIds: ['node:h02-context', 'node:h09-memory'], notes: '课件第 7 页图片文字。',
  },
  {
    sourceId: 'source:canonical-inventory-02', fragmentId: 'fragment:canonical-h02-scope', sourceType: 'project',
    title: 'Node Inventory 0.2：H02 Context Assembly',
    location: 'local-source://Desktop/云帆CRM-Agent学习系统-Node-Inventory-0.2-冻结执行版.md#L156-L167',
    text: 'H02 的范围是模型每轮决策前收到的上下文；System Prompt、Conversation History、Tool Definitions、Skill Index 和 Memory 信息属于其内部机制，不拆成独立 Node。',
    relatedNodeIds: ['node:h02-context'], notes: '项目 canonical 约束；sourceType 沿用既有 project 枚举，不将其误称为课程事实。',
  },
  {
    sourceId: 'source:project-crm-50', fragmentId: 'fragment:project-context-meter', sourceType: 'project',
    title: '云帆 CRM-Agent 5.0：上下文用量展示',
    location: 'local-source://Desktop/云帆CRM-Agent-5.0学习系统补充说明.md#L52-L62',
    text: '输入框附近的环形图标展示当前会话已用上下文、模型最大上下文和占比；当前轮实际输入 Token 用于校准，自动摘要后的下一轮按压缩后的上下文重新显示。',
    relatedNodeIds: ['node:h02-context'], notes: '项目产品化说明；不等同于课程定义。',
  },
  {
    sourceId: 'source:project-crm-audit', fragmentId: 'fragment:project-context-capabilities', sourceType: 'project',
    title: '云帆 CRM 系统审计：Agent 使用与长期记忆',
    location: 'local-source://Desktop/云帆CRM系统审计与信息收集-2026-09-19.md#L36-L42',
    text: 'Agent 使用层包含多会话与会话持久化、附件、模型切换和上下文占用提示；长期记忆以跨会话 MEMORY.md 承载。',
    relatedNodeIds: ['node:h02-context', 'node:h09-memory'], notes: '系统审计事实；不声称所有信息每轮均注入 Context。',
  },
  {
    sourceId: 'source:jd-agent-pm', fragmentId: 'fragment:jd-harness-signal', sourceType: 'jd',
    title: '国内 AI PM / Agent PM JD 调研：Harness 学习信号',
    location: 'local-source://Desktop/国内AI PM与Agent PM官网JD调研_学习系统输入_2026-09-27.md#L89-L103',
    text: '调研建议把 Context、Planning、Tool Execution、State、Safety 连成可追踪运行链；该表同时说明 Harness 机制并无完整 JD 正文证据，不能将建议冒充岗位原文。',
    relatedNodeIds: ['node:h02-context'], notes: 'JD 调研中的学习建议，不作为 H02 定义证据。',
  },
  {
    sourceId: 'source:interview-ai-pm', fragmentId: 'fragment:interview-context-question', sourceType: 'interview',
    title: 'AI PM 面经：上下文工程提问',
    location: 'local-source://Desktop/AI PM面经.txt#L180-L183',
    text: '面经记录的问题包括“提示词工程、上下文工程、Harness工程分别是什么？”',
    relatedNodeIds: ['node:h02-context'], notes: '只作面试信号，不作为技术定义。',
  },
  {
    sourceId: 'source:course-harness-upper',
    fragmentId: 'fragment:course-context-assembly',
    sourceType: 'course',
    title: 'Harness 入门（上）：模型可用上下文',
    location:
      'local-source://Desktop/云帆CRM资料汇总/课程基础知识点ppt/Harness入门（上）.pptx#slide=8',
    text: 'Tool 信息会作为 Context 发给模型；Context 还包括系统与用户提示词、历史会话和工具调用。',
    relatedNodeIds: ['node:h02-context'],
    notes: '课程原始课件的最小摘录，用于 H02 Context 的课程层 Claim。',
  },
  {
    sourceId: 'source:project-agent-factory',
    fragmentId: 'fragment:project-agent-context',
    sourceType: 'project',
    title: 'CRM Agent 创建时的 Context 装配',
    location:
      'local-source://project/agent-service/crm_agent/agent.py#L246-L255',
    text: 'create_deep_agent 接收 system_prompt、middleware、skills、permissions、context_schema、checkpointer 等运行时输入。',
    relatedNodeIds: ['node:h02-context'],
    notes: '只读项目代码定位；不代表运行时已完成端到端验证。',
  },
  {
    sourceId: 'source:course-harness-upper',
    fragmentId: 'fragment:course-tool-execution',
    sourceType: 'course',
    title: 'Harness 入门（上）：Agent Loop 与工具调用',
    location:
      'local-source://Desktop/云帆CRM资料汇总/课程基础知识点ppt/Harness入门（上）.pptx#slide=8,17',
    text: 'Agent 通过自主循环进行多轮推理与执行；示例循环包含工具调用、读取数据和结果输出。',
    relatedNodeIds: ['node:h06-tool-execution'],
    notes: '课程原始课件的最小摘录，用于 H06 Tool & Execution。',
  },
  {
    sourceId: 'source:project-agent-factory',
    fragmentId: 'fragment:project-tool-execution',
    sourceType: 'project',
    title: 'CRM Agent 工具注册与执行边界',
    location:
      'local-source://project/agent-service/crm_agent/agent.py#L196-L218',
    text: 'Agent 工厂先构建工具集合，再依据设置筛选 registered_tools，并将结果交给 Agent 运行时。',
    relatedNodeIds: ['node:h06-tool-execution'],
    notes: '项目实现证据；Tool 能力对象仍归 Capability，执行机制归 Harness。',
  },
] satisfies SourceIndex
