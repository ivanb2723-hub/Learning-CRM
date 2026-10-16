# Learning CRM

这是一个纯前端、可交互的 CRM Agent 学习系统，包含系统总览、分层视图、全域知识地图、节点附着知识卡、深读器，以及一条独立的客户分析学习路径样品。

## 本地运行

建议使用 Node.js **24.21.x** 和 npm **11.13.0**。

```bash
npm ci
npm run dev
```

打开 Vite 输出的本地地址：

- `/`：S0 系统总览，可通过界面进入 S0-L 和原 S1 知识地图。
- `/?view=s1`：原有 55 个 Canonical Node 的 S1 知识地图。
- `/?p1Path=1`：独立的 L1–L4 客户分析学习路径测试页。
- `/?view=s1&p1=1`：P1 实验知识地图，内有测试页入口。

P1 路径是隔离实验，不替代原 55 节点系统。L3 六个查询动作只是学习验证样本，不是固定的实际执行轨迹或最终知识结构。

## 验证

```bash
npm test
npm run typecheck
npm run build
npm run lint
```

仓库保留了 `src/` 源码与视觉资产、`content/` 正式内容、`experiments/p1/` 实验适配器与测试、`docs/` 架构及历史记录。测试页使用的 Work 完整正文位于 `src/features/p1-learning-path/source/`，合同和月报资料也保留在其中。

未上传 `node_modules`、构建产物、浏览器配置和本地 QA 缓存。部分来源索引使用 `local-source://` 占位标记；其引用的原始课程或项目文件不在仓库内。

本项目没有附带真实 CRM Agent 后端、业务数据或 AI 服务。个人学习进度和编辑记录保存在各自浏览器中，不随仓库分发或跨设备同步；P1 测试页也不读取或改写原系统的学习进度。

代码和仓库内原创内容采用 [MIT 许可证](LICENSE)。提及的第三方课程、产品与外部原始资料不因此获得相同授权。
