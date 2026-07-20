# 开发过程文档（Development Log）

本文档记录 China MOS 从零到当前形态的完整开发过程：分阶段的目标、架构决策、
遇到的真实问题与解决方案，以及可复现的命令。面向后续维护者与协作者。

---

## 目录

1. [总体架构](#总体架构)
2. [请求生命周期与数据流](#请求生命周期与数据流)
3. [阶段一：项目脚手架与 12 个模块](#阶段一项目脚手架与-12-个模块)
4. [阶段二：PostgreSQL + Drizzle 数据落库](#阶段二postgresql--drizzle-数据落库)
5. [阶段三：接入真实数据源](#阶段三接入真实数据源)
6. [阶段四：AI 搜索接入 RAG（含向量升级）](#阶段四ai-搜索接入-rag检索增强生成)
7. [关键设计决策与取舍](#关键设计决策与取舍)
8. [测试与验证方法](#测试与验证方法)
9. [问题与解决方案汇总](#问题与解决方案汇总)
10. [技术债与已知限制](#技术债与已知限制)
11. [目录结构](#目录结构)
12. [本地开发命令](#本地开发命令)

> 配套文档：[数据源说明 DATA_SOURCES.md](./DATA_SOURCES.md) · [运营手册 OPERATIONS.md](./OPERATIONS.md) · [部署指南 DEPLOYMENT_OVH_CLOUDPANEL.md](./DEPLOYMENT_OVH_CLOUDPANEL.md)

---

## 总体架构

```
Next.js (App Router, RSC)                    PostgreSQL (Docker)
┌─────────────────────────────┐              ┌──────────────────────┐
│ Server Component (page.tsx)  │  queries.ts  │  companies / …/ fx   │
│   └─ 从 DB 读取 ─────────────┼──────────────▶  (Drizzle ORM)       │
│   └─ 传 props → Client View  │              └──────────▲───────────┘
│        (i18n / 交互 / 图表)  │                         │ ingest.ts
└─────────────────────────────┘                         │ (幂等/容错)
              │ /api/chat (DeepSeek 流式)     ┌──────────┴───────────┐
              ▼                               │  src/lib/sources/*   │
       Vercel AI SDK                          │  14 个公开数据源      │
```

**关键模式：Server Component 取数 + Client View 渲染**
情报页面都拆成两个文件：
- `page.tsx`（**服务端**）：从 `src/lib/queries.ts` 读数据库，`await` 后把数据当 props 传下去；
- `*-view.tsx`（**客户端**）：持有 i18n（中/英/法切换）、深色模式、交互、图表。

这样既满足「RSC 从数据库取数」，又能让语言切换等交互在客户端即时生效。行类型从
`src/db/schema.ts` 用 `$inferSelect` 导出，客户端组件用 `import type` 引用（类型在编译期擦除，
不会把服务端专用的 `db/index.ts`（含 `server-only`）打进客户端包）。

**技术栈**：Next.js 16（App Router）· TypeScript · Tailwind v4 · Vercel AI SDK + DeepSeek ·
PostgreSQL + pgvector + Drizzle ORM · transformers.js（本地 embedding）· lucide-react。
三语 i18n 与深色模式是自建的轻量 Context。

---

## 请求生命周期与数据流

**A. 情报页面渲染（如 `/companies/byd`）**
```
浏览器 → Next 服务端 page.tsx(RSC)
       → queries.ts → Drizzle → Postgres 取该企业行
       → 传 props 给 company-view.tsx(client)
       → 客户端按当前语言渲染三语字段 + 图表；语言/主题切换即时生效（无需回服务端）
```

**B. AI 搜索 / RAG 问答（`/search` → `/api/chat`）**
```
AiPanel(useChat) ──POST {messages, mode, lang}──► /api/chat (Node runtime)
  1) 取用户最后一句 → retrieve(query)
       retrieve → embedQuery(transformers.js, 本地)  → 384 维向量
                → pgvector 余弦检索 rag_docs (阈值 0.80) → Top-K 命中（失败则回退词法）
  2) 命中资料拼进 system prompt（指示「优先基于资料作答并标注 [n]」）
  3) createUIMessageStream：先 write 'data-sources' 部件，再 merge DeepSeek streamText 流
  ◄── SSE 流 ── 前端 useChat：先渲染引用 chips，再逐字渲染 AI 回答
```

**C. 数据摄取（离线，`npm run db:ingest` / `db:embed`）**
```
ingest.ts → src/lib/sources/*（14 个公开源，幂等/容错）→ 写各业务表
embed.ts  → corpus.ts 汇总 60 文档 → transformers.js 批量嵌入 → 写 rag_docs(vector)
```

**关键模式：Server Component 取数 + Client View 渲染**
情报页面都拆成两个文件：
- `page.tsx`（**服务端**）：从 `src/lib/queries.ts` 读数据库，`await` 后把数据当 props 传下去；
- `*-view.tsx`（**客户端**）：持有 i18n（中/英/法切换）、深色模式、交互、图表。

行类型从 `src/db/schema.ts` 用 `$inferSelect` 导出，客户端组件用 `import type` 引用（类型在编译期
擦除，不会把服务端专用的 `db/index.ts`（含 `server-only`）打进客户端包）。

---

## 阶段一：项目脚手架与 12 个模块

**目标**：按 `prompt.md` 规格搭一个可运行的企业级 SaaS 基础，铺开尽可能多的模块。

1. `create-next-app`（TS + Tailwind + App Router + src 目录 + `@/*` 别名）。
   - 坑：目录里已有 `prompt.md`，脚手架报冲突 → 临时移走 `prompt.md`，生成后移回。
   - 实际装的是 Next.js 16 + Tailwind v4（最新）。
2. **主题系统**：`globals.css` 用 CSS 变量定义蓝灰商务色系 + `.dark` 覆盖；
   `@custom-variant dark` 实现类切换的深色模式（Tailwind v4 写法）。
3. **i18n**：`src/lib/i18n.tsx` 一个 Context + 字典，支持 zh/en/fr，`localStorage` 持久化。
4. **应用外壳**：`src/components/shell.tsx` 分组侧边栏 + 顶栏（语言/主题切换）。
5. **AI 流式面板**：`src/components/ai-panel.tsx` 用 `@ai-sdk/react` 的 `useChat` +
   `/api/chat` 路由（DeepSeek，OpenAI 兼容）。按 `mode`（search/consultant/report/company/playbook）
   切换 system prompt，按当前语言指示 AI 输出语言。
6. **12 个模块页面**：首页仪表盘、AI 搜索、企业情报（列表+详情）、行业、城市、供应链、
   政策、Playbooks（列表+详情）、知识图谱（交互式 SVG）、AI 顾问、报告生成、咨询工作台。
7. 初期数据放在 `src/lib/data.ts`（带 `sources` 字段的结构化模拟数据）。

**验证**：`npm run build` 通过（16 路由），preview 截图确认首页/知识图谱渲染正常。

---

## 阶段二：PostgreSQL + Drizzle 数据落库

**目标**：把模拟数据真正落到关系型数据库，页面改为从库读取。

1. 依赖：`drizzle-orm` `postgres`（postgres-js）+ `drizzle-kit` `tsx` `dotenv`。
2. **本地库用 Docker Compose**（`docker-compose.yml`），并用 `DATABASE_URL` 抽象连接串，
   以便随时换 Neon/Supabase 等云库。
3. **Schema**（`src/db/schema.ts`）：8 张表，三语字段用 **JSONB** 存。
4. **DB 客户端**（`src/db/index.ts`）：`server-only` 保护 + HMR 单例。
5. **种子脚本**（`src/db/seed.ts`）：从 `data.ts` 灌数据（自建 client，不引 `server-only` 模块）。
6. **查询层**（`src/lib/queries.ts`，服务端）：列表/按 slug 查询函数 + `$inferSelect` 行类型。
7. **页面重构**：全部情报页从「客户端 import 数组」改为「Server Component 取数 + Client View」。
8. 新增 npm 脚本：`db:up / generate / migrate / push / seed / studio / setup`。

**验证**：`npm run build` 后情报路由变为 `ƒ`（服务端渲染）；preview 确认企业列表/详情从库渲染。

---

## 阶段三：接入真实数据源

**目标**：用公开、免费、无 Key 的数据源替换模拟数据。详见
[DATA_SOURCES.md](./DATA_SOURCES.md)。分批推进：

- **批次 A**：Wikipedia（三语简介）+ Wikidata（成立/员工/官网）+ Google News（新闻）。
- **批次 B**：OpenAlex（研究趋势）+ UN Comtrade（贸易）+ OpenStreetMap（工业区）。
- **批次 C**：Google Patents（专利）。
- **批次 D**：World Bank（宏观指标）。
- **批次 E**：Yahoo Finance（上市公司财务）。
- **批次 F**：Frankfurter/ECB（人民币汇率）。
- **批次 G**：Wikidata SPARQL（省级 GDP + 展会）+ World Bank Procurement（国际招标）→ 新增「商机中心」模块。
  - 诚实处理：中国境内招投标无免费开放 API，故用「世行全球实时招标 + 中国官方采购平台目录」组合。

### 阶段四：AI 搜索接入 RAG（检索增强生成）

**目标**：让 AI 基于库里 14 个源的真实数据**检索后作答并引用来源**，而非纯生成。

- **检索器** `src/lib/rag/retrieve.ts`（server-only）：对全库（企业/行业/城市/供应商/政策/攻略/省份/展会/新闻）
  做**词法打分**。中文无空格，故用「空白分词 + CJK 2-gram」构造检索词；名称命中权重更高。
  返回 Top-K 记录的上下文文本 + 带编号的来源列表（`[n]` + 内链）。
  - 选型：语料很小（数十条结构化记录），词法检索又快又准、无需 embedding key；
    接口留好抽象，未来可换 pgvector 向量检索。
- **`/api/chat` 改造**：search/consultant/report/company 模式下先检索用户问题，把命中资料注入
  system prompt（指示「优先基于资料作答并用 `[n]` 标注」），再用 `createUIMessageStream`
  先推送 `data-sources` 数据部件、再 merge `streamText` 的输出。
- **`/api/retrieve`**：轻量检索端点，用于验证与前端预览。
- **前端** `ai-panel.tsx`：渲染 `data-sources` 部件为「检索到 N 条平台数据（RAG）」引用 chips，可点击跳转对应记录。
- **验证**：`/api/retrieve` 实测——「比亚迪 vs 宁德时代」召回两家企业+动力电池+新能源汽车行业；
  「深圳建厂」召回深圳（含 OSM 工厂）+ ODM 攻略；「广东省经济」召回省级 GDP 记录。检索准确、上下文约 2000 字。
  （AI 最终作答需 `DEEPSEEK_API_KEY`；检索半程已实测通过。）

#### 阶段四 · 升级：pgvector 向量检索

把词法检索升级为**语义向量检索**（词法保留为兜底）：

- **Postgres**：镜像换成 `pgvector/pgvector:pg16`（`docker compose up -d` 重建容器，数据卷保留），
  `CREATE EXTENSION vector`，新增 `rag_docs` 表（`vector(384)` 列 + HNSW 余弦索引）。
- **Embedding**：`src/lib/rag/embed.ts` 用 **transformers.js** 本地跑 `Xenova/multilingual-e5-small`
  （384 维，多语言，**无需 key**，首次自动下载 ~110MB 并进程内单例缓存）。e5 需要 `query:` / `passage:` 前缀。
- **语料共享**：把 corpus 构建抽到 `src/lib/rag/corpus.ts`（不含 `server-only`），供检索器与嵌入脚本复用。
- **嵌入脚本**：`src/db/embed.ts`（`npm run db:embed`）——从库构建 60 条文档、批量嵌入、写入 `rag_docs`。
- **检索器**：先向量检索（`embedding <=> query::vector` 余弦，阈值 0.80），失败/空时回退词法。
- **db:setup** 末尾追加 `db:embed`。
- **语义 + 跨语言实测**（均 `mode: vector`）：`电动车领军公司`→CATL/BYD/新能源汽车（数据无「电动车」字样）；
  `卖化妆品要什么资质`→CCC/WFOE/商标 攻略（无「化妆品」关键词）；英文 `best city for a factory`→上海/深圳/杭州（库内为中文）。
- **坑**：`server-only` 模块无法用 tsx 直接跑 → 语料/嵌入逻辑放在非 `server-only` 的 `corpus.ts`/`embed.ts`，
  仅 `retrieve.ts` 带 `server-only`；脚本各自建 db 连接。

每批：写 `src/lib/sources/*` 客户端 → 加 schema 列/表（`ALTER TABLE` 平滑加列 + `drizzle-kit generate`
生成迁移）→ 在 `src/db/ingest.ts` 接线 → 加 UI 展示 → 跑 `db:ingest` → preview 验证。

摄取管线核心特性：**幂等 + 容错**。任一源失败/限流时保留库中已有数据，反复运行累积各源最优结果
（例如 Comtrade 伙伴国、Overpass 工业区在多次运行间取最优）。

---

## 关键设计决策与取舍

| 决策 | 选择 | 理由 / 取舍 |
|------|------|------|
| 数据渲染方式 | RSC 取数 + Client View | 满足「服务端从库取数」，又保留客户端即时交互（语言/主题）。代价：每个模块两个文件。 |
| 三语存储 | JSONB `{zh,en,fr}` | 单行含全部语言，客户端按需选；避免多表 join。代价：非规范化。 |
| 摄取健壮性 | 幂等 + 非空才覆盖 | 公开源普遍限流/间歇性丢数据；反复运行累积各源最优结果，绝不因单次失败而回退。 |
| 反爬数据源 | curl 子进程（Google Patents / Yahoo） | 这些源用 TLS 指纹拦 Node fetch；curl 跨平台自带，最省事。 |
| 新闻源 | Google News RSS 主 / GDELT 备 | GDELT 对数据中心 IP 限流激进；RSS 稳定。 |
| RAG 检索 | pgvector 语义 + 词法兜底 | 语义泛化 + 中英跨语言；小语料 HNSW 足够快。词法在模型/索引缺失时兜底。 |
| Embedding | 本地 `multilingual-e5-small` | **无需 key**、可离线、隐私好；代价：首次下载 ~110MB、进程需常驻内存。 |
| 招投标 | 世行实时流 + 官方平台目录 | 中国境内招投标无免费开放 API，诚实标注、直达权威源，不伪造数据。 |
| LLM | DeepSeek（OpenAI 兼容） | 中文强、成本低、可用 Vercel AI SDK 直连；无 key 时界面仍可完整浏览。 |

## 测试与验证方法

本项目以**运行时验证**为主（而非单元测试）：

- **构建即类型检查**：`npm run build`（Next 内置 tsc）——多次靠它抓出真实类型问题（如 `convertToModelMessages` 返回 Promise、正则 flag target）。
- **浏览器预览验证**：每个 UI 变更后启动 dev server，用可访问性快照 / 截图确认真实渲染（而非假设），如企业财务卡、汇率 sparkline、省级 GDP 榜、商机中心。
- **数据源隔离探针**：接每个源前先用临时 `tsx` 脚本单独验证接口返回与字段（如 Wikidata QID、Comtrade `primaryValue`、Yahoo crumb 流），确认可用再接线。
- **RAG 检索端点**：`GET /api/retrieve?q=...` 直接验证召回质量与 `mode`（vector/lexical），无需 LLM key。
- **落库核对**：`docker exec ... psql` 直接查行数与关键字段，确认摄取结果（如财务、专利、工业区、向量条数）。

## 问题与解决方案汇总

真实开发中遇到并解决的问题（对后续维护很有参考价值）：

| # | 问题 | 根因 | 解决 |
|---|------|------|------|
| 1 | `create-next-app` 报目录冲突 | 目录已有 `prompt.md` | 生成前临时移走，生成后移回 |
| 2 | 首个 `docker compose up` 失败 | Docker Desktop 守护进程没起 | 脚本启动 Docker Desktop + 轮询 `docker info` 就绪 |
| 3 | Postgres 认证失败（中文乱码错误） | 主机 **5433 端口被一个已装的本地 Postgres 占用**，容器被其遮蔽 | 容器改映射到 **5544**，更新 `DATABASE_URL` |
| 4 | `drizzle-kit push` 卡在拉取 schema | 交互式/环境变量未从 `.env.local` 注入 | 改 `drizzle.config.ts` 用 `dotenv` 读 `.env.local`；用 `generate` + `psql` 应用迁移更确定 |
| 5 | `convertToModelMessages` 类型报错 | 该 AI SDK 版本返回 Promise | `await convertToModelMessages(...)` |
| 6 | GDELT 持续限流（单请求也返回提示） | 数据中心 IP 被激进限流 | 改用 **Google News RSS** 作主源，GDELT 降级备用 |
| 7 | Nominatim 地理编码 403 | OSM 封禁数据中心 IP | 改用 **Overpass** 抓工业区，城市坐标用固定 bbox |
| 8 | 深圳工业区混入香港站点 | bbox 越过深港边界 | 收紧 bbox 到 **22.52°N 以北** |
| 9 | Google News RSS 正则报 TS 错 | `/s` flag 需要更高的 TS target | 用 `[\s\S]` 代替 `.`＋`s` flag |
| 10 | Google Patents 对 Node fetch 返回 503 | Google **TLS 指纹拦截 undici** | 客户端改用 **curl** 抓取（跨平台自带） |
| 11 | Google Patents 会话级 IP 限流 | 短时间高频请求触发风控 | 加**指数退避重试**；非受限环境下次 `db:ingest` 自愈 |
| 12 | Yahoo `quoteSummary` 返回 Invalid Crumb | 需 cookie + crumb 握手 | 用 curl + cookie jar 实现三步握手 |
| 13 | Yahoo 客户端一直返回 null | curl 参数 `-o /dev/null` 破坏 mingw curl 流程 | 去掉 `-o /dev/null` |
| 14 | `tsx -e "..."` 带顶层 await 无输出 | `-e` 对顶层 await 处理不稳 | 改写成临时脚本文件再 `tsx` 执行 |
| 15 | `npm run build` 报 EPERM unlink `.next` | OneDrive 同步锁住 `.next` | `rm -rf .next` 后重建（项目在 OneDrive 目录内） |
| 16 | 生产 `/_next/static/*` 全 500（HTML 引用的 chunk 磁盘上不存在） | Next 16 **Turbopack 生产构建**在 Linux 上声明 `chunks/*.css` 却不写盘 | 生产改用 **webpack 构建**：`build` 脚本 `next build --webpack`（CSS 落到 `.next/static/css/`，与 HTML 一致）；deploy.sh 构建前 `rm -rf .next` |
| 17 | standalone 服务器伺服 `/_next/static` 500（无错误栈） | Next 16 + Turbopack standalone 伺服静态有问题 | 去掉 `output:'standalone'`，PM2 改跑 `next start`（伺服静态可靠 + 完整 node_modules） |

---

## 技术债与已知限制

- **供应商/政策/新闻仍为种子数据**：这三类目前来自 `data.ts`（无合适的免费实时源），其余均已接真实源。
- **Google Patents 会话级限流**：代码正确、可自愈；受限 IP 下当次 `db:ingest` 拿不到，换环境/冷却后自动补齐。
- **Comtrade 伙伴国 / Overpass 工业区间歇丢数据**：靠「非空才覆盖」跨运行累积，首次全新库可能需多跑 1–2 次 `db:ingest` 才最全。
- **Embedding 首次冷启动**：`/api/chat` 首个请求要加载模型（~几秒）；之后进程内单例常驻。改数据后需 `db:embed` 重建向量。
- **RAG 语料需手动重嵌**：`data.ts`/摄取变更后要跑 `db:embed`（未做自动触发）。
- **账户 / 多租户**：✅ 已实现（自建 scrypt + DB 会话 + 组织多租户）；团队邀请、审批流仍是路线图。
- **报告导出**：✅ 已实现真实 **Word（.docx，`docx` 库）** 与 **PDF（浏览器打印视图）** 导出；PPT 仍未做。
- **PPT 导出 / 邀请成员 / 订阅计费 / 政策提醒**：仍是路线图。
- **测试覆盖**：以运行时验证为主，暂无自动化单元/集成测试套件。

### 后续新增功能（阶段五）· 导出 / 图谱 / 地图 / 工具调用

- **报告真实导出**：`/api/export/docx`（markdown→docx，含标题层级/加粗/列表/中文字体）+ AI 面板每条回答的「导出 Word / 导出 PDF」按钮（PDF 走打印视图，中文渲染无字体嵌入问题）。
- **知识图谱接真实数据**：`src/lib/graph.ts` 从库内企业↔行业↔城市↔竞争↔出口市场↔供应商↔创始人↔母子公司关系生成图；`graph-view.tsx` 用 Fruchterman–Reingold 力导向布局 + 点击高亮邻居（35 节点）。
- **真实地图**：Leaflet + OpenStreetMap 瓦片（`osm-map.tsx` 客户端 + `map-embed.tsx` 用 `dynamic(ssr:false)` 加载）；城市详情页标记真实工业区坐标，首页标记城市。用 `CircleMarker`（SVG）避免 Leaflet 图标资源问题。
- **AI 工具调用**：`src/lib/rag/tools.ts` 定义 5 个工具（企业/行业精确查询、宏观指标、汇率、省级 GDP），`streamText` 带 `tools` + `stepCountIs(5)`，让模型对精确数值问题先查库再作答（与 RAG 上下文并用）。

### 阶段六 · 时间序列 / 对比 / 股权

- **时间序列图表**：`components/charts.tsx`（无依赖 SVG `LineChart`/`BarChart`）。企业 5 年月度股价（Yahoo `getPriceHistory`）、行业逐年出口（Comtrade `getChinaExportSeries` 逐年循环）、宏观近 12 年趋势（World Bank `getIndicatorSeries`，首页 sparkline）。新增列 `companies.price_history`、`indicators.series`、`trade.history`。
- **对比分析**（`/compare`）：企业/行业切换 + 双选择器 + 结构化指标并排表 + AI 点评面板。
- **股权 / 子公司**：`wikidata-sparql.ts` 的 `getOwnership`（P112 创始人 / P749 母公司 / P355 子公司）→ 企业页「股权结构」卡片 + 接入知识图谱。

### 阶段七 · 账户 + 多租户 + 用户数据

- **认证**：`src/lib/auth.ts` 自建会话认证——Node `scrypt` 加盐哈希、`sessions` 表、httpOnly cookie（生产 `secure`）。**无需 OAuth key / 邮件服务**。
- **多租户**：注册创建 `organizations` + `users`（owner）；用户数据按 `orgId` 隔离，可「共享给团队」。
- **用户数据**：`watchlist` / `notes` / `saved_analyses` 三表。详情页 `EntityUserPanel`（关注 + 笔记）；AI 回答「保存分析」；`/me` 我的空间汇总。
- **Server Actions**：`app/actions/auth.ts`、`app/actions/user-data.ts` 处理所有变更，均做服务端鉴权。
- **页面**：`/login`、`/signup`、`/me`；顶栏账户菜单（`Shell` 接收 `account` + `logout`）。

## 目录结构

```
src/
  app/
    layout.tsx                 根布局（Providers + Shell + 当前用户）
    page.tsx                   首页（server 取数）
    home-view.tsx              首页视图（client：指标+趋势/汇率/新闻/地图）
    api/chat/route.ts          DeepSeek 流式聊天路由（RAG 检索注入 + 来源推送 + 工具调用）
    api/retrieve/route.ts      RAG 检索端点（验证/预览）
    api/export/docx/route.ts   报告 Word 导出（markdown→docx）
    actions/auth.ts            登录/注册/退出 Server Actions
    actions/user-data.ts       关注/笔记/保存分析 Server Actions
    login/  signup/  me/       账户页与「我的空间」
    compare/                   对比分析（server + client view）
    companies/  industries/  cities/  supply-chain/  policy/
    playbooks/  graph/  consultant/  reports/  workspace/  opportunities/
                               每个情报模块：page.tsx(server) + *-view.tsx(client)
  components/
    shell.tsx  ai-panel.tsx  ui.tsx  china-map.tsx  charts.tsx
    osm-map.tsx  map-embed.tsx  entity-user-panel.tsx
  db/
    schema.ts                  19 张表（情报 13 + 账户/用户数据 6）+ $inferSelect 行类型
    index.ts                   Drizzle 客户端（server-only）
    seed.ts                    种子数据（来自 data.ts）
    ingest.ts                  真实数据摄取编排（含所有映射配置）
    embed.ts                   构建 pgvector 向量索引（rag_docs）
  lib/
    i18n.tsx  theme.tsx        三语 + 深色模式 Context
    data.ts                    种子数据 + 静态配置（分类/来源清单）
    queries.ts                 服务端查询层
    auth.ts                    会话认证（scrypt / sessions / cookie，server-only）
    user-data.ts               用户实体状态查询（关注/笔记，server-only）
    graph.ts                   知识图谱构建（server-only）
    export/markdown-to-docx.ts 报告 Word 生成
    rag/
      corpus.ts                共享语料构建 + 词法打分（非 server-only）
      embed.ts                 本地多语言 embedding（transformers.js 单例）
      retrieve.ts              RAG 检索器（pgvector 向量检索 + 词法兜底）
      tools.ts                 AI 工具调用（精确结构化查询）
    sources/                   13 个数据源客户端
      wikipedia.ts wikidata.ts googlenews.ts gdelt.ts openalex.ts
      comtrade.ts overpass.ts googlepatents.ts worldbank.ts yahoo.ts frankfurter.ts
      wikidata-sparql.ts wbprocurement.ts
drizzle/                       生成的 SQL 迁移（0000–0008）
docs/                          DATA_SOURCES / DEVELOPMENT / OPERATIONS / DEPLOYMENT_OVH_CLOUDPANEL
deploy.sh  docker-compose.yml  docker/init.sql  drizzle.config.ts  .env.local(.example)
```

---

## 本地开发命令

```bash
# 一次性初始化
npm install
cp .env.local.example .env.local        # 填 DEEPSEEK_API_KEY（DATABASE_URL 已预填本地 Docker:5544）

# 数据库
npm run db:setup      # docker 起库 + 建表 + 种子 + 真实数据摄取 + 向量索引（需 Docker Desktop）
npm run db:ingest     # 仅刷新真实数据源（幂等，可反复运行）
npm run db:divisions  # 导入/刷新全国行政区划（省/市/区县 3429 行，不含在 db:setup 内）
npm run db:embed      # 重建 RAG 向量索引（改了数据后）
npm run db:studio     # Drizzle Studio 可视化

# 开发 / 构建
npm run dev           # http://localhost:3000
npm run build

# 迁移（改了 schema.ts 后）
npm run db:generate   # 生成 SQL 迁移
npm run db:migrate    # 应用迁移
```

**环境要点**
- Windows + PowerShell/Git Bash；项目位于 OneDrive 目录内（注意偶发的 `.next` 同步锁 → `rm -rf .next`）。
- 本地 Postgres 走 Docker，主机端口 **5544**（避开已装的本地 Postgres 的 5433）。
- 若无 `DEEPSEEK_API_KEY`：界面可完整浏览，仅 AI 生成功能提示配置。
- 部分数据源（Google Patents / Yahoo）通过 **curl** 抓取以绕过反爬；curl 在 Windows 10+/macOS/Linux 自带。
