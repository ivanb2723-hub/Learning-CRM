# S1 Node Focus + Attached Knowledge Card 首屏设计

## 目标与边界

在现有 CRM Agent Explorer 的同一 S1 Canvas 中实现“点击圆形 Node → 平滑聚焦 → 节点旁显示附着式知识卡首屏 → 关闭卡片仍保留 Focus → 退出 Focus 返回 Macro”。仅 55 个主体域 canonical 知识 Node 可点击并进入该流程；中央 CRM Agent Core 与四个 Domain 结构标题不触发知识卡或学习打卡，也不在本轮扩展为 Focus 入口。H02 Context Assembly 是本轮唯一正式内容验收样本。S0、S0-L 的资产、交互和 S1 Macro 的节点坐标、连线与布局均冻结。

本轮不实现完整七字段阅读、Expanded Reading、S2+、独立详情页、Evidence / Interview Lens 全文、旧 Card Grid、学习笔记或复杂关系动画。底部“继续阅读完整七字段”只作为清楚标注“即将开放”的不可用语义入口，不跳转、不打开空白内容。

## 数据契约

在现有 `KnowledgeCardSchema` 增加可选 `preview: { definition: string; mechanism: string }`。只给 `card:h02-context` 填写这两个首屏短字段；其原有 `definition`、`mechanism` 及其他冻结正文不变。H02 preview 忠实压缩现有内容，不引入新的 Claim、项目事实或技术推演：

- definition：`Harness 在模型每轮决策前，将所需的系统规则、历史消息、工具定义、Skill 信息和相关 Memory 组织为当前运行时 Context。`
- mechanism：`信息来源 → 选择 / 裁剪 / 排序 / 注入 → Model API`

三条边界从现有 `card.boundaries` 读取，不建立第二套边界。实施前已核对 `card:h02-context.boundaries`：`Context ≠ Memory`、`Context ≠ System Prompt`、`Context ≠ Context Window` 三条均存在且状态为 `frozen`，无需修补；实施中若校验发现缺失，也只可按已冻结 H02 内容恢复原义。通用首屏对有正式 Card 但无 preview 的节点使用 `card.definition` 和 `card.mechanism`，必要时在卡片正文区域滚动，不改写或截断正文语义。没有 Card 的节点只呈现“内容待补充”，不生成示例正文。S1 Inventory 的 `H02` 与 canonical `node:h02-context` 通过稳定编号映射；卡片渲染组件只接收 canonical Card，不内嵌 H02 文案。

## 交互与状态

点击或键盘激活 Node 后进入 Focus：保持 S1 Canvas 不换页，通过现有缩放/平移机制把所选 Node 带入可阅读的焦点位置，同时保留周围地图作为上下文。Focus 的视觉变化只作用于所选态、视口与临时强调，不改 Macro 静态布局。卡片随 Node 锚点定位，但保持屏幕像素级的可读尺寸，不随地图缩放变得过小。焦点过程结束和用户再次缩放、平移、改变窗口大小后均重新计算附着位置。

卡片定位先评估锚点的右、左、上、下四侧可用空间，再选择不出视口、与邻近可见节点重叠最少的位置；保留清晰连接指向。空间不足的窄视口将 Node 放入上部可见区域，卡片置于其下方并约束在工作区内，卡片内部可滚动。不得把卡片移到系统侧栏或独立页面。

卡片关闭只清除 `cardOpen`，保持 `focusedNodeId` 和当前视口；“退出聚焦”清除这两个状态，并平滑恢复进入 Focus 前的 S1 Macro 视口。再次点击其他 Node 会切换聚焦并打开相应卡片或“内容待补充”。现有全量索引保持原状，本轮不扩展其行为。

学习打卡仅针对有正式 Knowledge Card 的 canonical Node；仅显示“内容待补充”的 Node 不提供打卡。它独立于卡片开关和 Focus，以 canonical Node ID 为键保存在带版本号的 `localStorage` 命名空间。点空心圆打卡，再点取消；刷新后状态保持。存储不可用时本次会话仍可操作，不因异常阻断卡片。打卡按钮有可访问名称和按下状态。Core 与 Domain 标题不参与打卡。

## 首屏视觉与内容

卡片顺序严格沿用用户图一：标题区（`H02 · Agent Runtime / Harness`、`Context Assembly`、`上下文组装`、打卡、关闭）、一句话定义、核心机制、三条关键边界、底部阅读入口。图二仅指导圆角、白色轻立体容器与柔和阴影；图三仅指导 Node 附着和小连接；图四仅指导分隔、内边距和排版节奏。全部沿用现有白蓝色、2.5D 白模视觉；不照搬参考图的黑色或紫灰色主题。

## 验证与交付

测试覆盖 preview Schema 与旧 Card 兼容、canonical 数据读取、无 Card 降级、Focus/Card 独立状态、打卡和撤销及刷新持久化、定位边界与邻近 Node 避让。运行内容校验、完整 test、typecheck、build；在真实浏览器检查 H02 点击、动画聚焦、附着卡、打卡/撤销、刷新、关闭卡片后仍聚焦、退出 Focus 返回 Macro，以及至少桌面和窄视口可读性。提交首屏截图、H02 preview 字段内容、测试结果和修改文件清单后停止等待验收。
