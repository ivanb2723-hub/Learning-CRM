# C-S0 Visual Geometry Spec

> 状态：Phase 1 几何规格已确认，包含进入 Phase 2 前的最终修订。  
> 本文件授权开始且仅开始 S0 Static Reconstruction。  
> 唯一视觉真相：Direction C 的 S0 确认效果图。

## 1. Reference 与测量口径

- Reference：`D:\.codex\generated_images\01a0c488-10dd-7d22-a0f2-9e63307f8b50\exec-63001ce6-5afb-4ee7-bc9e-c1362f33a091.png`
- Reference 原始尺寸：`1487 × 1058 px`。
- 测量辅助图：`C-S0-reference-grid.png`，按 100 px 网格覆盖原图，不参与产品构建。
- 坐标原点：Reference 左上角 `(0, 0)`。
- 工程验收公差冻结为：整体 bbox / Core / Domain anchors 约 `±3%`，Shared Ground 主要轮廓 `±4%`，annotation anchor `±5%`。抗锯齿、阴影与透明边缘不纳入实体轮廓测量。
- `System Atlas geometry` 指 Shared Ground、Central Core、四个 Domain 的实体部分，不含标题和 annotation 文本。

## 2. Canvas / Composition

| 项目 | Reference 像素坐标或尺寸 | Viewport 比例 |
|---|---:|---:|
| Canvas | `1487 × 1058` | `100% × 100%` |
| System Atlas geometry bbox | `x 108–1338, y 121–956` | 宽 `82.7%`，高 `78.9%` |
| 含 annotation 的视觉 bbox | `x 61–1410, y 121–956` | 宽 `90.7%`，高 `78.9%` |
| System Atlas 视觉中心 | 约 `(744, 529)` | `(50.0%, 50.0%)` |
| Central Core 几何中心 | 约 `(744, 500)` | `(50.0%, 47.3%)` |
| 左侧几何最外缘 | `x ≈ 108` | `7.3%` |
| 右侧几何最外缘 | `x ≈ 1338` | `90.0%` |
| 上侧几何最外缘 | `y ≈ 121` | `11.4%` |
| 下侧几何最外缘 | `y ≈ 956` | `90.4%` |

### 标准 viewport 规则

- Desktop 基准以 `1487:1058` 的构图比例为准。
- 首次进入 S0 时，主体 geometry bbox 必须约占 viewport 宽度 `81–85%`、高度 `77–81%`。
- 标准视图不能完全交给 React Flow `fitView()` 自由求解；需要一个按上述 bbox 计算的基准 viewport transform。
- viewport 只能使用一个统一缩放值：`scale = min(availableWidth / referenceWidth, availableHeight / referenceHeight)`。`82.7vw` 与 `78.9vh` 是同一等比构图的结果，不是两个可分别强制匹配的缩放目标。
- 禁止对 x / y 使用不同 scale，禁止为同时命中宽高百分比而非等比拉伸 System Atlas。
- `fitView()` 继续作为用户操作和容错机制，但不能改变首次构图的设计量级。
- 宽屏扩展时优先增加外围留白，不继续放大主体；窄屏时允许主体超出可视区并通过 pan 浏览，不能缩成画布中央的小图标。

## 3. Shared Ground / System Fabric

### 3.1 总体定义

Shared Ground 是一个连续、带厚度、带转折与凹口的白色十字型系统结构。它不是四条透明道路，也不是四个平台之间的 Edge。

- 总 footprint：约 `x 108–1338, y 137–956`。
- 中央交汇区：约 `x 600–885, y 350–645`。
- 主顶面：暖白到冷白，Domain 色只进入内层 lane 和局部边缘。
- 厚度：Reference 中主平台视觉厚度约 `25–38 px`，随投影方向变化。
- 外轮廓必须包含圆角感对应的折线倒角、中心连接凹口、两层边缘和内层轨道。

### 3.2 四臂测量

| 区域 | Geometry bbox | 主平台/臂长特征 | 嵌入位置 |
|---|---|---|---|
| 上臂 / Business | `x 486–1001, y 122–420` | 约宽 `515`、纵深 `298`；下缘左右各有向中央收束的凹口 | Core 上/后，中心约 `(744, 279)` |
| 左臂 / Resources | `x 108–647, y 349–707` | 约宽 `539`、纵深 `358`；右侧通过白色双层连接颈接入中心 | Core 左，中心约 `(365, 509)` |
| 右臂 / Capability | `x 842–1338, y 356–697` | 约宽 `496`、纵深 `341`；左侧连接颈与 Core 同层 | Core 右，中心约 `(1096, 510)` |
| 下臂 / Runtime | `x 471–1008, y 590–956` | 约宽 `537`、纵深 `366`；上缘双凹口抱合中央结构 | Core 下/前，中心约 `(742, 769)` |

### 3.3 专用 SVG 结构

建立单一 `SystemFabricVisual`，建议使用 Reference 坐标系等比缩放，内部至少分为：

1. `fabric-top-face`：完整十字型连续顶面，不拆成四块独立矩形。
2. `fabric-front-faces`：左臂前侧、下臂前侧及中央前侧的厚度面。
3. `fabric-right-faces`：Business/Capability/Runtime 可见右侧面。
4. `fabric-inner-rim`：沿外轮廓内缩约 `18–28 px` 的第二层边缘。
5. `fabric-domain-fields`：四个 Domain 的低饱和局部色场，只存在于平台内部。
6. `fabric-lanes`：Core 到四域的窄轨道；线宽视觉约 `4–8 px`，不得替代实体地基。
7. `fabric-notches`：四臂进入中央区域前的凹口和转折。
8. `fabric-contact-shadows`：只表达平台离地和模块接触，不改变几何轮廓。

### 3.5 所有权边界（冻结）

- 所有连续地基、domain field、双层 rim、连接颈、lane、notch 与平台厚度面只允许由单一 `SystemFabricVisual` 绘制。
- 四个 `*RegionVisual` 不得各自重绘完整平台、独立托盘、底板或外圈 rim。
- 四个 `*RegionVisual` 只负责该 Domain 的专用内部模块、接口、局部身份标记与必要的 module-to-module path。
- 任何隐藏后仍能看见四块独立平台的实现，均视为未通过此边界。

### 3.4 单独验收

隐藏全部 Domain modules、annotation、Governance 与 React Flow Edge，只保留 `SystemFabricVisual + CrmAgentCoreVisual` 时，仍必须能识别：

- 中央系统核心；
- 上、左、右、下四个明确区域；
- 它们属于同一个连续系统结构。

## 4. Central Core / CrmAgentCoreVisual

### 4.1 Reference 几何

- Core 总 bbox（含底座与顶部控制体）：约 `x 646–850, y 354–608`。
- Core 主体 bbox：约 `x 669–819, y 399–558`。
- 主体 screen-space bbox 可见宽高比约 `0.94:1`。该数值只用于截图测量，不得机械解释成真实几何中的“高盒”。真实轮廓以 Direction C reference 为最高优先级：低重心、稳定、短宽、非高塔式。
- 底座 bbox：约 `x 634–858, y 475–612`，嵌入中央交汇区。
- 顶部控制体：约 `x 718–769, y 376–449`，只占主体顶部局部，不贯穿主体。
- 视觉中心：约 `(744, 500)`。

### 4.2 专用组件分面

建立 `CrmAgentCoreVisual`，禁止继续由普通 `IsoBlock` 参数组合代替。组件至少包含：

1. 六边/倒角等距底座，与 Shared Ground 中央凹口咬合。
2. 短宽主躯体，独立顶面、左前面、右前面。
3. 蓝色只集中在右侧面、底部结构带和连接端口；正面保持白色主体。
4. 顶部小型控制体，体积约为主躯体的 `12–16%`。
5. 四向结构端口，位置与四条 fabric lane 对齐。
6. `CRM Agent` 文本只位于主躯体正面，不另做 CTA 卡片。

## 5. 四个 Domain footprint 与专用视觉组件

四域只共享投影方向、线条粗细和材质 token，不共享同一个“平台 + 随机方块”模板。

### 5.1 BusinessRegionVisual

- Geometry bbox：约 `x 487–1000, y 122–420`。
- 模块有效区：约 `x 618–907, y 123–347`。
- 主建筑：约 `x 696–795, y 122–302`，明显高于周边模块。
- 周边模块：4–5 个低体量业务块，分布在主建筑四周，高度分三级。
- 身份色：橙色只用于主楼冠部、局部边缘与 annotation anchor。
- 必须包含：主业务塔楼、低层产品块、流程/结果模块、平台内层暖色 field。
- 禁止：五个等高方块、整个平台黄色填充。

### 5.2 ResourcesRegionVisual

- Geometry bbox：约 `x 108–647, y 349–707`。
- 模块有效区：约 `x 207–539, y 371–602`。
- Storage cylinder：两大一中，约位于 `x 208–370, y 399–588`。
- Server racks：至少 3 组，约位于 `x 348–529, y 381–590`，高度不同并带水平槽位。
- 构图重心低而横向稳定，不能像建筑群。
- 必须包含：圆柱储存、机架、低层基础设施块、Resources 身份色青绿色的底层连接线。

### 5.5 四域身份色（冻结）

| Domain | Identity color | 用途边界 |
|---|---|---|
| Business & Product | `#E69A3A` | 局部冠部、field、lane、annotation anchor |
| Resources & Infrastructure | `#18A999` | 存储接口、底层连接线、field、lane、annotation anchor |
| Capability | `#7A63E8` | Hub、module path、field、lane、annotation anchor |
| Agent Runtime / Harness | `#2F7DE1` | execution lane、状态节点、field、lane、annotation anchor |

身份色只用于局部识别，不得把完整 Domain 平台涂成大面积纯色。Resources 不得再复用 Runtime 蓝色。

### 5.3 CapabilityRegionVisual

- Geometry bbox：约 `x 842–1338, y 356–697`。
- 模块有效区：约 `x 982–1235, y 399–594`。
- 中心能力 Hub：约 `x 1050–1154, y 397–512`，体量最大并带功能标记。
- 卫星能力单元：4 个左右，围绕 Hub 分布，体量显著小于 Hub。
- Hub 与卫星之间存在紫色 module-to-hub path。
- 必须表现为功能组件集合，不得表现为一排楼房。

### 5.4 RuntimeRegionVisual

- Geometry bbox：约 `x 471–1008, y 590–956`。
- 模块有效区：约 `x 586–925, y 655–832`。
- 主 execution engine：约 `x 648–807, y 674–802`，横向长体。
- 辅助组件：2–4 个，沿前后执行方向排列，而非环形散布。
- execution lane：从左后向右前形成明确顺序，带 3–4 个状态节点。
- 必须一眼区别于 Capability：Capability 是 Hub-and-spoke；Runtime 是有方向的 sequence/flow。

## 6. Annotation geometry

Annotation 使用独立 DOM/SVG layer，不嵌入 Domain 主体。

| Annotation | Anchor dot | 文字起始区 | Leader 方向 |
|---|---:|---:|---|
| Business | `(860, 205)` | `x ≈ 1027, y ≈ 121` | 右上，两段折线 |
| Resources | `(184, 470)` | `x ≈ 61, y ≈ 315` | 左上，两段折线 |
| Capability | `(1199, 431)` | `x ≈ 1329, y ≈ 359` | 右上，两段折线 |
| Runtime | `(578, 797)` | `x ≈ 247, y ≈ 872` | 左下，两段折线 |
| Governance | `(1228, 812)` | `x ≈ 1286, y ≈ 830` | 右下，短折线 |

文字层级：

- 中文主标题约 `20–24 px` 等效视觉尺寸；
- English Term 约为中文标题的 `68–76%`；
- 说明文字只保留一行；
- anchor、leader 与 Domain 身份色一致，但不扩大为卡片背景。

## 7. Governance plane

- 类型：一条从左上/后方向右下/前方斜穿系统的透明空间带。
- 中心线大致从 `(390, 135)` 经 `(600, 300)`、`(1104, 713)` 到 `(1230, 817)`。
- 可见带宽：约 `70–105 px`，两端渐隐。
- 角度：相对水平约 `31–34°`。
- z-order：位于部分 Shared Ground 与 Domain 之间，不能整体压在全部模块上方。
- 默认透明度：主体填充约 `6–12%`，中心线/节点约 `35–55%`。
- 不编号、不占第五 Domain，不承载内容卡片。

## 8. React Flow 与 viewport 映射

| 视觉职责 | 工程映射 |
|---|---|
| 整体坐标、pan、zoom | React Flow viewport |
| 连续十字地基 | `ViewportPortal > SystemFabricVisual` 专用 SVG |
| Central Core | `CrmAgentCoreVisual` 专用 Custom Node |
| Business | `BusinessRegionVisual` 专用 SVG/DOM group |
| Resources | `ResourcesRegionVisual` 专用 SVG/DOM group |
| Capability | `CapabilityRegionVisual` 专用 SVG/DOM group |
| Runtime | `RuntimeRegionVisual` 专用 SVG/DOM group |
| Governance | `ViewportPortal > GovernancePlaneVisual` |
| Annotation | 独立 annotation layer，绑定 Node anchor 坐标 |
| React Flow Edge | S0 默认近乎不可见；结构关系由 fabric 表达 |

### 标准初始 viewport

- 以 Reference geometry bbox 中心 `(723, 538)` 附近作为可视中心校准点；最终以重建 SVG 的真实 bbox 重新计算。
- Desktop 标准截图中 geometry bbox 目标宽度约 `82.7vw`、高度约 `78.9vh`。
- 上述两个占比必须在统一 scale 下自然形成；若 viewport 比例变化，允许其中一个占比留出更多空白，不允许独立缩放 x / y。
- 禁止因 annotation overflow 或隐藏 Handle 扩大 fit bounds。
- 初次渲染使用明确的基准 transform；窗口 resize 后按同一比例规则重算。

## 9. 需要删除或替换的当前旧视觉实现

以下仅描述 Phase 2 的删除/替换范围；Phase 1 不执行代码修改。

### 必须替换

- 当前由通用 `IsoBlock` 组合出的 `SystemCore`：替换为 `CrmAgentCoreVisual`。
- 当前通用 `IsoDeck`：不再作为四域共同外形，改由 `SystemFabricVisual` 提供统一地基，四域组件只负责专用内部结构。
- 当前 `DomainModules` 通过 tone 分派但继续复用普通方盒的方案：替换为四个目标专用视觉组件。
- 当前 `AtlasScene` 中四块独立 `fabric-arm` polygon：替换为一个连续十字型 top path 及其 front/right side faces。
- 当前近似矩形/八边形平台轮廓：替换为 Reference 的凹口、转折和双层边缘轮廓。
- 当前普通高蓝色 Core 和重复透明 core segment 表达：全部按专用 Core 轮廓重新定义。

### 必须清理

- 已被 `display: none` 隐藏但仍保留的旧 `.atlas-region*` / `.atlas-core*` card-like CSS。
- 仅为旧版 platform、inner-deck、hub、pillar、generic module 服务的 DOM 与样式。
- 用大面积透明色片模拟 Shared Ground 的实现。
- 会主导画面的虚线 React Flow Edge。

### 保留

- React Flow Canvas、pan、zoom、fitView 工具能力。
- S0/A 状态定义与相同 Node identity。
- `atlasProjection` 中的语义位置关系和 Domain ID；视觉坐标将在 Phase 2 按本 Spec 校准。
- Content Model、Schema、Inventory、Source Index、authoringContent 与测试数据全部不动。

## 10. Phase 2 执行边界与验收公差

以下内容已确认，可进入 S0 reconstruction：

1. `1487 × 1058` 为本轮 S0 reference 基准。
2. 主体 geometry bbox 目标为约 `82.7% × 78.9%` viewport。
3. Shared Ground 采用单一连续专用 SVG，而非四个平台拼接。
4. Central Core 和四域分别采用目标专用视觉组件。
5. Annotation 与 Governance 使用本 Spec 的坐标关系。
6. 当前通用平台、通用方盒和旧隐藏 CSS 在 Phase 2 被替换/清理。

量化验收：

1. 整体 geometry bbox：相对 Reference `±3%`。
2. Central Core bbox / center：相对 Reference `±3%`。
3. 四个 Domain anchor：相对 Reference `±3%`。
4. Shared Ground 主要外轮廓：相对 Reference `±4%`。
5. annotation anchor：相对 Reference `±5%`。
6. 所有测量基于统一等比 viewport transform。

Phase 2 只允许 S0 Static Reconstruction；不开始 A、transition、阴影润色、S1 或后续状态。
