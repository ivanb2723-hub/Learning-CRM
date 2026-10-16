# S1 Node Focus + Attached Card 首屏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 S1 Canvas 中为 55 个知识节点增加平滑 Focus 和附着卡首屏，用 H02 验收内容与独立学习打卡。

**Architecture:** canonical `knowledgeCards[]` 仍是唯一知识内容源，新增可选 `preview` 只承载首屏短句。S1 地图保持现有绝对布局；纯函数负责 Node→Card 解析、Focus 目标、卡片避让与打卡持久化，React 组件只编排状态与渲染。浮卡处于 S1 工作区的屏幕坐标层，连到当前圆形 Node，不参与画布缩放。

**Tech Stack:** React 19、TypeScript 6、Vite 8、Vitest 4、Zod 4、原生 CSS 和浏览器 `localStorage`。

**Spec:** `docs/superpowers/specs/2026-10-09-s1-node-focus-attached-card-design.md`

## Global Constraints

- S0/S0-L 资产与交互、S1 Macro 坐标和连线保持不变。
- Focus/Card 仅适用于 55 个主体域知识 Node；Core 和四个 Domain 标题不进入此流程。
- 不实现完整七字段、Expanded Reading、S2+、旧 Card Grid 或知识索引；底部阅读入口标注“即将开放”且不可激活。
- H02 已冻结正式正文完全不变；仅在其 canonical Card 增加忠实压缩的可选 `preview`。三条已存在的 frozen 边界直接复用。
- 没有正式 Card 的节点只显示“内容待补充”，无学习打卡；有 Card 无 preview 时回退到正式 definition/mechanism。
- 代码编辑须先有针对性失败测试；浏览器视觉与交互验收不能被测试通过替代。

## Review Focus

- 窄视口或卡片高于工作区：卡片仍在 S1 可视工作区内，内容可滚动。
- H02 附近其他圆形 Node：附着卡择位减少遮挡，不越过工作区边界。
- 用户滚轮缩放、拖拽、窗口尺寸变化后：卡片继续指向所选 Node；不会留下脱离节点的浮层。
- `localStorage` 不可用或旧值损坏：打卡仍可在本次会话切换，不阻断 Focus/Card。
- 点击无 Card Node、Core、Domain：前者只显示待补充且无打卡；后两者不触发卡片或打卡。

---

### Task 1: Canonical preview 与内容边界

**Files:**
- Modify: `src/domain/content/schema.ts`（KnowledgeCardSchema）
- Modify: `content/authoringContent.ts`（只加 H02.preview）
- Test: `src/domain/content/knowledgeSystem.test.ts`
- Test: `content/authoringContent.test.ts`

**Interfaces:**
- Produces: `KnowledgeCard['preview']?: { definition: string; mechanism: string }`。
- Preserves: `card:h02-context` 现有 definition、mechanism、boundaries 和来源关联。

- [ ] **Step 1: 写失败测试**：验证 H02 preview 两句与规格完全一致，三条 frozen 边界仍原样存在；无 preview 的 H06 仍通过内容校验。测试中固定 H02 原正文快照值，阻止误改。
- [ ] **Step 2: 验证 RED**：运行 `npm test -- src/domain/content/knowledgeSystem.test.ts content/authoringContent.test.ts`，确认仅因缺 preview 失败。
- [ ] **Step 3: 最小实现**：给 Schema 增可选严格 preview 对象，只在 H02 Card 加两个指定短句，不触及其正式字段。
- [ ] **Step 4: 验证 GREEN**：运行上述两个测试文件与 `npm run typecheck`。
- [ ] **Step 5: 提交**：仅暂存本任务相关文件并提交。

### Task 2: Node/Card 解析与学习打卡

**Files:**
- Create: `src/features/s1-preview/s1CardModel.ts`
- Create: `src/features/s1-preview/s1CardModel.test.ts`
- Create: `src/features/s1-preview/s1LearningState.ts`
- Create: `src/features/s1-preview/s1LearningState.test.ts`

**Interfaces:**
- Produces: `resolveS1Card(code: string, content: ContentBundle): { nodeId: string | null; card: KnowledgeCard | null }`，只按 canonical Node 的稳定编号关联；`cardPreview(card: KnowledgeCard): { definition: string; mechanism: string; boundaries: KnowledgeCard['boundaries'] }`。
- Produces: `readLearned(storage: Storage | undefined): Record<string, boolean>` 与 `writeLearned(storage: Storage | undefined, next: Record<string, boolean>): void`，命名空间 `crm-agent-explorer:s1-learned:v1`；存储异常由调用层保留内存状态。

- [ ] **Step 1: 写失败测试**：H02 解析到 frozen Card；H06 无 preview 退回正式字段；未有正式 Card 的 Inventory Node 不会拥有可打卡 Card；边界引用而非重建。覆盖空/损坏/不可用存储与切换后的重新读取。
- [ ] **Step 2: 验证 RED**：运行两个新测试文件，确认因目标导出缺失失败。
- [ ] **Step 3: 最小实现**：建立稳定编号解析、首屏数据选择和版本化布尔存储；不在 JSX 写 H02 专有文案。
- [ ] **Step 4: 验证 GREEN**：运行两个新测试文件和内容校验测试。
- [ ] **Step 5: 提交**：仅暂存本任务文件并提交。

### Task 3: Focus 目标与浮卡避让几何

**Files:**
- Create: `src/features/s1-preview/s1FocusGeometry.ts`
- Create: `src/features/s1-preview/s1FocusGeometry.test.ts`
- Modify: `src/features/s1-preview/s1Viewport.ts`（仅复用/补充现有平滑缩放算法所需的纯函数）
- Modify: `src/features/s1-preview/s1Viewport.test.ts`

**Interfaces:**
- Produces: `focusScrollTarget(node: {x:number;y:number}, zoom: number, viewport: {width:number;height:number}): {left:number;top:number}`，为右侧浮卡预留空间；窄视口改为上方节点/下方卡片。
- Produces: `placeAttachedCard(anchor: Rect, viewport: Rect, obstacles: Rect[], card: Size): {left:number;top:number;side:'right'|'left'|'top'|'bottom'}`，四侧评分并钳制边界。

- [ ] **Step 1: 写失败测试**：桌面 H02 目标在可见区；窄屏节点与卡均可见；卡片优先选择无碰撞侧；四侧拥挤时选择重叠面积最小且不越界；边界邻近时翻侧。
- [ ] **Step 2: 验证 RED**：运行新几何测试，确认因函数缺失失败。
- [ ] **Step 3: 最小实现**：纯几何计算，不改 `buildS1Layout()`、Node 坐标或 Macro 连线。
- [ ] **Step 4: 验证 GREEN**：运行几何与 viewport 测试。
- [ ] **Step 5: 提交**：仅暂存本任务文件并提交。

### Task 4: 通用 Attached Card 首屏

**Files:**
- Create: `src/features/s1-preview/AttachedKnowledgeCard.tsx`
- Create: `src/features/s1-preview/attached-knowledge-card.css`
- Create: `src/features/s1-preview/AttachedKnowledgeCard.test.tsx`

**Interfaces:**
- Consumes: Task 2 的 `cardPreview` 结果和 canonical Card；Task 3 的侧向定位结果。
- Produces: `<AttachedKnowledgeCard code name domainLabel card learned placement onToggleLearned onClose />`，无 Card 时仅渲染待补充，无打卡。

- [ ] **Step 1: 写失败渲染测试**：H02 按图一顺序输出标题、中文名、短定义、机制、三条 canonical 边界、禁用的阅读入口；无 Card 只输出“内容待补充”，没有打卡按钮；有 Card 无 preview 不丢正文。
- [ ] **Step 2: 验证 RED**：运行新组件测试，确认缺组件失败。
- [ ] **Step 3: 最小实现**：白蓝轻立体卡、柔和阴影、附着指向、清楚的打卡/关闭控件与不可激活入口；卡片正文内部滚动，避免硬裁切。
- [ ] **Step 4: 验证 GREEN**：运行新组件测试与 typecheck。
- [ ] **Step 5: 提交**：仅暂存本任务文件并提交。

### Task 5: S1 Canvas 交互编排

**Files:**
- Modify: `src/features/s1-preview/S1Preview.tsx`
- Modify: `src/features/s1-preview/s1-preview.css`
- Modify: `src/features/s1-preview/S1Preview.test.tsx`
- Modify: `src/features/s1-preview/S1Integration.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–4 的解析、存储、几何和卡片组件。
- Preserves: `SystemAtlasMilestoneA.tsx` 及所有 S0/S0-L 文件无需修改。

- [ ] **Step 1: 写失败测试**：55 个 Node 为可聚焦按钮；Core 和四 Domain 不具有 Card/打卡入口；H02 在 S1 内触发 Focus/Card 的结构可观察；关闭卡片与退出 Focus 是独立控制。针对状态变化增加纯状态测试或浏览器交互测试，不用静态 HTML 冒充交互证明。
- [ ] **Step 2: 验证 RED**：运行 S1 两个现有测试文件及新增测试，确认目标交互缺失造成失败。
- [ ] **Step 3: 最小实现**：在原地图内增加 `focusedNodeId`、`cardOpen` 和 learned 状态；Node 点击/键盘触发同一路径；使用现有 rAF 缩放机制平滑聚焦与恢复 Macro；卡片浮层根据锚点、邻居、视口重算位置；关闭仅关卡，退出才复位。禁用 Core/Domain 卡片入口。
- [ ] **Step 4: 验证 GREEN**：运行 S1 测试、typecheck；检查无明显 React 警告。
- [ ] **Step 5: 提交**：仅暂存本任务文件并提交。

### Task 6: 全量验证与真实浏览器验收

**Files:**
- Create: `qa/s1-node-focus/` 内的桌面与窄视口截图、简短结果记录。
- Modify: 仅修正前述任务验收发现的本轮缺陷，并先加失败测试。

**Interfaces:**
- Produces: H02 首屏截图、无 Card 降级截图、验证结果和文件清单。

- [ ] **Step 1: 运行内容校验与完整测试**：`npm test`；明确记录失败项，不以局部绿灯代替全套结果。
- [ ] **Step 2: 运行静态检查**：`npm run typecheck`、`npm run build`。
- [ ] **Step 3: 真实浏览器桌面验收**：从 S0-L 进入 S1；点击 H02；查看聚焦、附着位置、首屏顺序；打卡/撤销与刷新保存；关卡保留 Focus；退出 Focus 回 Macro；点击无 Card Node；确认 Core/Domain 不进入卡片流程。
- [ ] **Step 4: 真实浏览器窄视口验收**：核对节点与卡片同屏可见、卡片可滚动、不遮出工作区；缩放、拖拽后连接仍指向 Node。按中心局部和整图分别截图。
- [ ] **Step 5: 整理输出**：记录实际截图路径、H02 preview 内容、测试结果、修改文件清单；停下等待用户验收，不继续开发深入阅读。
