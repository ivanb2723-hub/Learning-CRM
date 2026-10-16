# Inventory 0.2 增量对齐记录

本记录只描述 Phase 1 FAQ / RAG Integration Test Fixture 从旧 Seed 到冻结 Inventory 0.2 的迁移，不重新定义 Inventory。

## 已发现并对齐的差异

| 旧 Seed | Inventory 0.2 对齐 | 处理 |
| --- | --- | --- |
| `Agent Runtime` | `Agent Runtime / Harness` | Domain 重命名，记录 Boundary Revision |
| `Capability and Execution` | `Capability` | Tool 能力对象留在 Capability；执行机制迁入 H06 |
| `Infrastructure` | `Resources and Infrastructure` | Model、MCP、Memory Store、Checkpoint Store 归 Resources |
| `Context Assembly` | `H02 Context` | 使用 canonical H02 |
| `FAQ Recall`、`Retrieved FAQ Context`、`FAQ Chunking` | `C16 RAG` 的内部机制 | 不再作为 canonical Node |
| `Knowledge Retrieval Tool` | `C10 Knowledge Retrieval Tool` | 保留为唯一检索调用入口 |
| 无 H06 | `H06 Tool & Execution` | 新增 Harness 执行机制节点 |
| 无 B09 / H04 / H08 / H09 / R08 / R09 / R10 | 对齐冻结 Inventory 归属 | 加入 canonical Node，未扩展本轮 Case 主路径 |
| C13 Service Info Tool | 非 canonical | 校验器明确禁止重新加入 |

## Boundary Revision

- original：旧 Seed 将 Capability 与 Execution 合并在同一 Domain 名称中，并把部分 RAG 内部步骤提升为 Node。
- revised：能力对象、Harness 执行机制、Resources 本体分域；RAG 内部步骤收回 C16。
- reason：遵守 Inventory 0.2 和三条 Frozen Boundary。
- impact：FAQ/RAG Case 的路径 ID 更新；七对象模型、Case 结构和 React Flow 技术边界不变。

## 未在本轮声称完成

- 未验证真实 FAQ CSV、sqlite-vec、chunk 数量或真实调用轨迹。
- 未声称 Recall、Faithfulness 或 Answer Quality 指标。
- 未扩展完整 Inventory 内容，只加入本轮归属保护所需 canonical Node。
