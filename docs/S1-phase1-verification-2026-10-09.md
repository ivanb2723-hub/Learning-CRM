# S1 Phase 1｜圆形确定性布局原型验证报告

状态：**静态原型已交付，等待用户验收；未接入正式 S1 导航，未进入 S2。**

## 1. Phase 0 审计结论

详见 [Phase 0 审计与差异](./S1-phase0-audit-2026-10-09.md)。冻结 Inventory 0.2 已找到；仓库旧 FAQ/RAG Seed 只有 18 个编号身份正确、6 个编号冲突、50 个权威编号缺失。因此本原型使用独立的、从冻结 Inventory 0.2 转录的**预览映射**，不修改正式 `nodes[]`、Schema、Card、Relation 或用户未提交的旧改动。

## 2. 原型与文件边界

预览地址：`http://127.0.0.1:5173/s1-preview.html`（在项目目录运行 `npm run dev -- --host 127.0.0.1`）。生产构建也产出 `dist/s1-preview.html`。

新建：`s1-preview.html`、`src/features/s1-preview/main.tsx`、`S1Preview.tsx`、`s1-preview.css`、`s1Inventory.ts`、`s1Layout.ts`、`s1Layout.test.ts`；截图在 `qa/s1-phase1/`。本报告与 Phase 0 审计为新增文档。仅修改 `vite.config.ts` 以登记独立多页预览构建及忽略测试浏览器缓存的 watch，修改 `.gitignore` 以忽略该缓存目录。**未修改** `src/App.tsx`、`src/main.tsx`、`src/features/system-atlas-v2/*`、`src/assets/system-atlas/*`、`src/features/content-focus/*`、`content/*` 或 `src/domain/content/*`。

## 3. Canonical Node 覆盖

| 范围 | Inventory 0.2 | 预览正确转录 | 地图默认可见 | 完整名称可达 |
| --- | ---: | ---: | ---: | ---: |
| Business & Product（含 UX） | 13 | 13 | 13 | 13 |
| Agent Runtime / Harness | 12 | 12 | 12 | 12 |
| Capability | 15 | 15 | 15 | 15 |
| Resources & Infrastructure | 15 | 15 | 15 | 15 |
| Governance 横切层 | 7 | 7 | 0 | 7 |
| Evaluation 横切层 | 12 | 12 | 0 | 12 |
| **总计** | **74** | **74** | **55** | **74** |

默认 Macro 为四个主体 Domain + 55 个主体 Node。顶部“全量索引”列出其完整编号与名称；“治理与评估”是独立横切清单入口，不被画成第五、第六 Domain。C13 是目录实例，**未**计入 74 项，也未画成 Node。没有生成任何缺失 Card。

## 4. 坐标与硬规则

- 复核后的环抱版画布：`2000 × 2000`；Core 中心 `(1000,1000)`，圆形直径 `140`。
- 四个圆形 Domain 枢纽直径 `156`，分别在 Core 上、右、下、左，中心距 `245`：Business `(1000,755)`、Capability `(1245,1000)`、Harness `(1000,1245)`、Resources `(755,1000)`。比初版靠近中心；这是近圆心的枢纽环，不再是四角分散的枢纽。
- 55 个 Node 均为直径 `120` 的圆，按**同一个 Core 中心**的四层半径 `380 / 520 / 660 / 800` 排列，所属 Domain 各占约 90° 连续外弧，分别展开至 `±15° / ±29° / ±35° / ±40°`。四域外圈各保留 4 个节点，形成 16 点连续外轮廓；其余节点在内层交错，不再按各 Domain 枢纽自成一团。节点和枢纽之间使用浅色二次贝塞尔曲线。
- Core 保护区：中心同上，半径 `230`。断言逐个检查 Node 的整个轴对齐外包矩形仍处在外向半平面，并与保护区不相交；圆形对象之间至少 6 px 间隙；画布不溢出。同一份数据重复计算坐标完全一致。
- 1920×1080 首屏适配约 39% 显示完整宏观结构；缩放可至 140%，画布滚动平移。缩略全图**不声称** 55 个名称同时可读；全量索引与放大视图提供完整可达性。
- 域色仅用于小圆点、极细导航线和 Domain 轮廓；背景近白色，无大面积彩雾。圆形网络只参考 NOVA 的空间组织，不复制其纯白扁平 UI 风格。

## 5. Edge 语义登记

| Source | Target | 类型 | 语义 | 依据 | 默认 |
| --- | --- | --- | --- | --- | --- |
| System Core | Business / Harness / Capability / Resources（4 条） | Navigation | 进入主体 Domain 的空间组织 | 冻结四域结构 | 显示 |
| Business hub | B01–B09、UX01–UX04（13 条） | Navigation | 所属 Node，可进入该 Domain 范围 | Inventory 0.2 归属 | 淡线显示 |
| Harness hub | H01–H12（12 条） | Navigation | 同上 | Inventory 0.2 归属 | 淡线显示 |
| Capability hub | C01–C12、C14–C16（15 条） | Navigation | 同上；C13 降级 | Inventory 0.2 归属 | 淡线显示 |
| Resources hub | R01–R15（15 条） | Navigation | 同上 | Inventory 0.2 归属 | 淡线显示 |

这 59 条均为**无方向导航组织线**，绝非技术调用、执行顺序或已确认 Relation。当前 Macro 没有常驻域内 Structure Edge / 跨域 Relation Edge。候选关系（例如 H02–H03、C10–C16）在取得 `type / direction / meaning / evidence` 核验前不画。

## 6. 浏览器截图与实测

- [1920×1080 默认未聚焦 S1 Macro](../qa/s1-phase1/s1-macro-1920x1080.png)
- [高分辨率几何与圆形节点辅助图](../qa/s1-phase1/s1-macro-hires.png)
- [NOVA 布局反馈后的环抱版截图](../qa/s1-phase1/s1-ring-1920x1080.png)（当前待验收版；前两张保留作为修改前对照）

在本机 Edge 浏览器直接访问独立页面并截屏；在 Codex 内置浏览器再次打开，确认 55 个 Node 容器在 DOM/可访问树中；点击“全量索引”可见四组 13/12/15/15 完整编号和名称；点击“治理与评估”可见 G01–G07、E01–E12；“放大”从 17% 增至 32%（内置浏览器窄视口）。默认无 H02 Focus、无 Card。另打开原系统根路径，S0 正常显示；点击 S0-L 后标题与层级正常出现。上述属于可用性回归，并非对既有 S0/S0-L 视觉逐像素复验。

## 7. 自动验证

| 检查 | 结果 |
| --- | --- |
| Inventory 74 项 / C13 排除 / 四主体域 | PASS |
| 外向半平面、中心保护区零侵入、对象不碰撞、不越界、稳定坐标、连续外环、弯曲导航线 | PASS（`s1Layout.test.ts` 5 项） |
| 全部 Vitest | PASS（11 文件、71 项） |
| TypeScript typecheck | PASS |
| oxlint | PASS |
| Vite build（含独立 `s1-preview.html`） | PASS |
| 浏览器默认 Macro / 索引 / 横切层 / 放大 / S0 与 S0-L 打开 | PASS |

## 8. 已知缺陷、未实施范围与验收闸门

- **非阻塞但需用户判断**：在 1920×1080 一屏显示全部 55 个圆形 Node 时，缩略标签不能逐项舒适阅读。放大/滚动与全量索引可读、可达；是否接受这种“先看空间、再读节点”的披露策略由用户验收。
- 预览数据和正式 `authoringContent.nodes[]` 尚未迁移；正式接入前必须单独处理 6 个错身份和 50 个缺失编号，并核验所有受影响引用。本阶段不得把原型冒充正式数据迁移。
- 未实施 S2 Focus、Card、H02 选中、Relation Explore、学习打卡、动画或正式入口替换。
- **现在停止**。等待用户确认圆形空间秩序和默认截图；若不通过，仅在下一轮按反馈调整静态 S1 原型。
