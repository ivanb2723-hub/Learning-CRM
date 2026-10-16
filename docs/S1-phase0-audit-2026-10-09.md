# S1 Phase 0｜只读工程审计与差异（2026-10-09）

## 结论

Phase 1 可在**独立预览入口**继续；不允许把当前 `authoringContent.nodes[]` 直接当作全域 S1 的权威数据。冻结的 Node Inventory 0.2 已在桌面找到，可为独立静态预览提供只读编号、名称和归属。现有错误身份留待单独的数据迁移任务，不在本轮静默修改。

## 权威资料与工程状态

- 已找到：原开发环境中的 `云帆 CRM Agent 学习系统 — System Handoff Baseline V2.1（最终冻结版）.txt`、`云帆CRM-Agent学习系统-Node-Inventory-0.2-冻结执行版.md`、`云帆CRM-Agent学习系统-V2.1-Addendum-v1.0.md`、`云帆CRM-Agent学习系统-S1S2联合交互契约与第三窗口交接说明-v2.0.md`、第二窗口冲刺计划 v3.0。本轮不把后两份交接文档升格为 Node 身份依据。
- Git：`main`；进入本轮前工作树已有大量修改和未追踪文件，涉及 `content/*`、`src/domain/content/*`、`src/features/content-focus/*`、`src/features/system-atlas-v2/*` 及 S0 资产、QA 文件。全部原样保留，不清理、不重置、不覆盖。
- 应用入口：`src/main.tsx` → `src/App.tsx` → `src/features/system-atlas-v2/SystemAtlasMilestoneA.tsx`。S0/S0-L 的视图、React Flow 节点、底图、过渡在 `src/features/system-atlas-v2/*` 和 `src/assets/system-atlas/*`；这些及既有 `App.tsx`/`main.tsx` 本轮不改。
- 版本：React 19.2.8、React Flow 12.11.6、Vite 8.2.2、TypeScript 6.0.3、Zod 4.6.5、Vitest 4.1.11。`test/typecheck/lint/build` 脚本存在。React Flow 可复用，但本轮隔离预览更安全，不引入新布局引擎。
- 内容入口：`content/authoringContent.ts`、`content/sourceIndex.ts` → `src/domain/content/content.ts` → Zod schema / `validateContent.ts`。现有临时 `ContentFocus.tsx` 为单 Domain Card Grid / Node Card 测试载体，非全域 S1；可复用数据校验经验，不复用其外观。
- H02 Card 及 Evidence、Interview Lens 有工程数据；`reviewStatus: frozen` 是当前字段值，**不代表本次用户对 S1 或 H02 最终验收**。H06 为 `reviewed`，其余部分 FAQ/RAG Card 为 `draft`。

## Inventory 0.2 对照

Inventory 0.2：四主体域 55 项（Business 9 + UX 4、Harness 12、Capability 15、Resources 15），横切 G 7 + E 12，共 74 项；C13 明确非 Canonical。

| 组别 | 权威数 | 当前 `nodes[]` 正确编号/归属 | 缺失编号 | 冲突/错身份 |
| --- | ---: | --- | --- | --- |
| Business + UX | 13 | B09 | B03–B08、UX01–UX04（10） | B01/B02 为 FAQ Request/Response，非权威同名节点（2） |
| Harness | 12 | H01–H04、H06–H09（8） | H05、H10–H12（4） | 已有名称为英文简写，需以后核对正式中文名 |
| Capability | 15 | C10、C16（2） | C02–C09、C11–C12、C14–C15（12） | C01 被写成 Product FAQ Skill；Inventory 中它是 Skill 总节点（1） |
| Resources | 15 | R02–R05、R08–R10（7） | R01、R06–R07、R11–R15（8） | 无编号级冲突；现有英文名为简写 |
| Governance + Evaluation | 19 | 无 | G04–G07、E01–E12（16） | G01–G03 被用作评估对象，与权威 Governance 身份冲突（3） |

当前 `nodes[]` 共 24 项：编号身份正确 18、编号冲突 6、权威编号缺失 50。现有 Card 仅 6 张（H02、H06、C01、C10、C16、R03）；其中 C01 Card 随同编号身份冲突，不可用于权威 S1。不存在批量补 Card 的本轮授权。

## Phase 1 边界与风险

- 新建独立 `s1-preview.html` 与 `src/features/s1-preview/*`，以 Inventory 0.2 转录的**预览专用只读映射**展示 74 项；不写入 `authoringContent.ts`，不修改 schema、关系、Card、S0/S0-L。
- 55 个主体 Node 以四个 Domain 的外向扇区确定性布局；19 个 G/E Node 作为横切清单入口可达，不建立第五/第六 Domain。初始 Macro 需要全量覆盖计数，详情可通过缩放/平移查看；单屏全部标签同时可读不现实。
- 只绘制 System Core→Domain 的**导航线**；Domain 到节点的导航线可绘制，均明确不是技术调用线。既有 `relations[]` 含过时/冲突身份，全部不导入正式 Macro；证据不足的域内/跨域 Relation 不画。
- 风险：旧数据和权威 Inventory 的冲突会阻止把预览直接替换为正式 S1，但**不阻塞隔离静态原型**。正式内容迁移与交互接入需要后续单独批准。
