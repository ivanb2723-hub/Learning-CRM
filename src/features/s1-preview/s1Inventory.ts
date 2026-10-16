// Static preview transcription of Node Inventory 0.2 (frozen execution edition).
// This is not a migration of authoringContent.nodes[] and contains no Card content.
export type S1DomainId = 'business' | 'harness' | 'capability' | 'resources'
export type S1InventoryNode = { id: string; name: string; domainId: S1DomainId | 'governance' | 'evaluation' }

export const inventoryDomains: { id: S1DomainId; title: string; subtitle: string }[] = [
  { id: 'business', title: '业务与产品', subtitle: 'Business & Product' },
  { id: 'harness', title: '智能体运行机制', subtitle: 'Agent Runtime / Harness' },
  { id: 'capability', title: '能力', subtitle: 'Capability' },
  { id: 'resources', title: '资源与基础设施', subtitle: 'Resources & Infrastructure' },
]

const primaryRows: { domainId: S1DomainId; rows: string }[] = [
  { domainId: 'business', rows: `B01|CRM Agent 产品定位
B02|CRM 用户与角色
B03|CRM 业务流程
B04|传统 CRM 痛点与 Agent 介入点
B05|Agent vs Workflow
B06|人机协作与自动化边界
B07|产品价值与验证边界
B08|MVP 与功能优先级
B09|主动式 Agent / 数字员工
UX01|Agent 入口与快捷指令
UX02|过程可见性
UX03|Approval Card（审批卡片）
UX04|模型切换与输入能力` },
  { domainId: 'harness', rows: `H01|输入与请求接收
H02|Context Assembly（上下文组装）
H03|Model Decision（模型决策）
H04|Planning / Todo（规划与任务拆解）
H05|Agent Loop（Agent 循环）
H06|Tool & Execution（工具与执行）
H07|Skill Discovery & Usage（Skill 发现与使用）
H08|State & Checkpoint（状态与检查点）
H09|Memory（记忆）
H10|Safety & Approvals（安全与审批机制）
H11|Orchestration & Sub Agent（编排与子 Agent）
H12|Context Window & Token Budget（上下文窗口与 Token）` },
  { domainId: 'capability', rows: `C01|Skill（业务任务能力）总节点
C02|客户线索分析 Skill
C03|线索评分 Skill
C04|产品 FAQ Skill
C05|销售月报 Skill
C06|合同生成 Skill
C07|飞书消息 Skill
C08|CRM Read Tool（CRM 查询工具）
C09|CRM Write Tool（CRM 写入工具）
C10|Knowledge Retrieval Tool（知识检索工具）
C11|File / Word Tool（文件与 Word 工具）
C12|Scheduler Tool（定时任务工具）
C14|Feishu Tool（飞书工具）
C15|MCP External Tool（MCP 外部工具）
C16|RAG / Knowledge Retrieval Capability（RAG / 知识检索能力）` },
  { domainId: 'resources', rows: `R01|CRM Business Data（CRM 业务数据）
R02|Model（模型）
R03|Knowledge Base（知识库）
R04|Embedding（向量化）
R05|Vector Store（向量库）
R06|Business Rule Files（业务规则文件）
R07|Files / Generated Artifacts（文件与生成物）
R08|Long-term Memory Store（长期记忆存储）
R09|State / Checkpoint Store（状态与检查点存储）
R10|MCP（协议 / 接入基础设施）
R11|Feishu Channel（飞书渠道）
R12|Agent Working Directory（Agent 工作目录）
R13|Database / SQLite（数据库）
R14|API / External Service（API / 外部服务）
R15|Frontend / Backend / Agent Service（应用运行结构）` },
]

const overlayRows = [
  { domainId: 'governance', rows: `G01|Identity & Role（身份与角色）
G02|Data Scope（数据范围）
G03|Tool Policy & Approval Policy（工具策略与审批规则）
G04|Server-side Validation（服务端业务校验）
G05|File / MCP / External Boundary（外部能力边界）
G06|Prompt Is Not Security Boundary（Prompt 不是安全边界）
G07|Prompt Injection / Agent Security（提示词注入与 Agent 安全）` },
  { domainId: 'evaluation', rows: `E01|Functional Test vs Quality Evaluation（功能测试 vs 质量评估）
E02|Evaluation Dataset（评测集）
E03|Scoring Rubric（评分标准）
E04|Tool / Trajectory Evaluation（工具与执行轨迹评估）
E05|Answer Quality（回答质量）
E06|Task Success & Outcome Validation（任务成功与真实结果校验）
E07|RAG Evaluation（RAG 评估）
E08|Permission & Safety Evaluation（权限与安全评估）
E09|Hard Gate / Soft Metric（硬门禁 / 软指标）
E10|Latency / Token / Cost（延迟 / Token / 成本）
E11|Baseline & Regression（基准线与回归评测）
E12|Bad Case Analysis（Bad Case 分析）` },
] as const

function parseRows(domainId: S1InventoryNode['domainId'], rows: string): S1InventoryNode[] {
  return rows.split('\n').map((row) => {
    const separator = row.indexOf('|')
    return { id: row.slice(0, separator), name: row.slice(separator + 1), domainId }
  })
}

export const primaryInventory = primaryRows.flatMap(({ domainId, rows }) => parseRows(domainId, rows))
export const overlayInventory = overlayRows.flatMap(({ domainId, rows }) => parseRows(domainId, rows))
