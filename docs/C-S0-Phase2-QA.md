# C-S0 Phase 2 Static Reconstruction QA

> 范围：仅 S0 / System Overview 静态重建。  
> 未开始：A Layered View、transition、阴影润色、S1 及后续状态。

## 验收基准

- Reference：`1487 × 1058 px` Direction C S0。
- Viewport：x / y 共用一个等比 `scale`，不做非等比拉伸。
- 公差：整体 bbox / Core / Domain anchors `±3%`；Shared Ground 主轮廓 `±4%`；annotation anchor `±5%`。

## 本轮检查结果

| 检查项 | 结果 |
|---|---|
| 四域方位 | 通过：Business 上/后，Resources 左，Capability 右，Runtime 下/前 |
| 四域身份色 | 通过：Business 橙、Resources 青绿、Capability 紫、Runtime 蓝 |
| Resources 底层连接线 | 通过：使用 Resources 青绿色，不再复用 Runtime 蓝色 |
| Central Core | 通过：专用低重心轮廓，不再由通用 `IsoBlock` 高塔组合代替 |
| 统一 scale | 通过：`min(width / 1487, height / 1058)`，x/y 不分离缩放 |
| System Fabric 所有权 | 通过：地基、field、rim、lane、连接颈统一由 `SystemFabricVisual` 绘制 |
| Domain Visual 所有权 | 通过：四域节点只绘制专用内部模块与接口，S0 不再绘制独立平台 |
| Governance | 通过：独立透明斜穿 plane，非第五 Domain、非信息卡 |
| React Flow Edge | 通过：S0 降至近乎不可见，结构关系由 Shared Ground 表达 |

## QA 产物

- `qa-s0-phase2.png`：实际 S0 静态渲染。
- `qa-s0-phase2-overlay.png`：Reference 与实际渲染 50% 叠加。
- `qa-s0-phase2-side-by-side.png`：Reference / 实际渲染并排对照。

叠加检查显示主要外轮廓、Core 中心、四域锚点与 annotation 锚点均进入冻结公差。材质、最终阴影、模块精细度不属于本阶段验收内容。

## 工程验证

- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm test -- --run`：4 个测试文件、23 个测试通过。
- `npm run build`：通过；Vite 仅报告现有单 chunk 超过 500 kB 的非阻塞警告。
