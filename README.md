# China MOS — China Market Operating System

AI 驱动的企业级中国市场进入与战略咨询操作系统。帮助欧洲企业**了解中国、进入中国、寻找合作伙伴、建立供应链、制定市场战略并持续经营中国业务**。

> 本仓库是根据 [`prompt.md`](./prompt.md) 规格构建的**可运行 MVP 基础**：真实的 Next.js 架构 + 12 个核心模块 + 接入 DeepSeek 的真实流式 AI。数据源目前为模拟数据，可逐步替换为真实数据接口。

## 技术栈

- **Next.js 16**（App Router，Server Components）+ **TypeScript**
- **PostgreSQL + Drizzle ORM**（数据落库，情报页均为服务端从数据库读取）
- **Tailwind CSS v4** + 自建轻量 UI 组件（shadcn 风格）
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`) + **DeepSeek**（OpenAI 兼容）流式输出
- **RAG 检索增强**：AI 搜索/顾问先从库内 14 个真实数据源检索相关记录，注入上下文并引用来源
- 中文 / English / Français 三语切换 + 深色模式 + 响应式

## 已实现模块

| 模块 | 路由 |
| --- | --- |
| 首页仪表盘（Hero + AI 搜索 + 指标 + 新闻 + 热力图） | `/` |
| AI 全局搜索 | `/search` |
| 企业情报（列表 + AI 企业档案/SWOT/五力） | `/companies` |
| 行业情报 | `/industries` |
| 城市情报 | `/cities` |
| 供应链 Intelligence（供应商目录 + AI 推荐/RFQ） | `/supply-chain` |
| 政策法规 Intelligence | `/policy` |
| Playbooks 攻略中心（AI 生成攻略） | `/playbooks` |
| 知识图谱（交互式关系网络） | `/graph` |
| AI 咨询顾问 | `/consultant` |
| AI 报告生成（PDF/Word/PPT 占位） | `/reports` |
| 咨询工作台（客户/项目看板） | `/workspace` |

## 快速开始

```bash
npm install
cp .env.local.example .env.local   # 填入 DEEPSEEK_API_KEY（DATABASE_URL 已预填本地 Docker）

# 一键起数据库 + 建表 + 灌入种子数据（需要 Docker Desktop 运行中）
npm run db:setup

npm run dev                        # http://localhost:3000
```

在 [platform.deepseek.com](https://platform.deepseek.com) 获取 API Key。未配置 key 时界面仍可浏览，仅 AI 生成功能会提示配置。

## 数据库（PostgreSQL + Drizzle）

本地开发用 Docker Compose 起一个 Postgres（映射到主机 **5544** 端口，避免与已装的本地 Postgres 冲突）。
换成 Neon / Supabase 等云库时，只需把 `.env.local` 的 `DATABASE_URL` 换成云库连接串即可。

| 命令 | 作用 |
| --- | --- |
| `npm run db:up` | 启动 Postgres 容器 |
| `npm run db:generate` | 由 `src/db/schema.ts` 生成 SQL 迁移到 `drizzle/` |
| `npm run db:migrate` / `db:push` | 应用迁移 / 直接同步 schema |
| `npm run db:seed` | 用 `src/lib/data.ts` 灌入种子数据 |
| `npm run db:ingest` | **从真实数据源拉取并更新数据库**（见下） |
| `npm run db:studio` | 打开 Drizzle Studio 可视化查看数据 |
| `npm run db:setup` | 起库 + 建表 + 种子 + 真实数据摄取，一键完成 |

- Schema：`src/db/schema.ts`（8 张表，三语字段用 JSONB 存储）
- DB 客户端：`src/db/index.ts`
- 查询层（服务端）：`src/lib/queries.ts` —— 情报页面用它从数据库读取

## 真实数据源摄取（`npm run db:ingest`）

`src/db/ingest.ts` 从**免费、无需 API Key** 的公开数据源拉取真实数据并写入数据库，
拉取失败时自动回退到种子数据（幂等，可反复运行刷新）：

| 数据源 | 用途 | 客户端 |
| --- | --- | --- |
| **Wikipedia REST** | 企业**三语**（中/英/法）真实简介 | `src/lib/sources/wikipedia.ts` |
| **Wikidata** | 结构化事实：成立年份(P571)、员工数(P1128)、官网(P856) | `src/lib/sources/wikidata.ts` |
| **Google News RSS** | 首页真实中国商业新闻 | `src/lib/sources/googlenews.ts` |
| **GDELT** | 新闻备用源（有 5 秒/次限流） | `src/lib/sources/gdelt.ts` |
| **OpenAlex** | 行业**研究趋势**（论文年发表量，技术活跃度） | `src/lib/sources/openalex.ts` |
| **UN Comtrade** | 行业**对外贸易**（中国出口额 + 主要出口市场） | `src/lib/sources/comtrade.ts` |
| **OpenStreetMap / Overpass** | 城市**工业区/园区**（真实名称 + 坐标） | `src/lib/sources/overpass.ts` |
| **Google Patents** | 企业**专利 / 知识产权**（专利总数 + 代表专利） | `src/lib/sources/googlepatents.ts` |
| **World Bank Open Data** | 首页**真实宏观指标**（GDP/CPI/FDI/出口/人口，含年份与同比） | `src/lib/sources/worldbank.ts` |
| **Yahoo Finance** | 上市公司**财务概览**（市值/股价/PE/营收/利润率/ROE/52周） | `src/lib/sources/yahoo.ts` |
| **Frankfurter (ECB)** | 首页**人民币汇率**（EUR/USD/GBP/JPY，含 30 日走势） | `src/lib/sources/frankfurter.ts` |
| **Wikidata SPARQL** | **省级 GDP 排行** + **展会**（官网） | `src/lib/sources/wikidata-sparql.ts` |
| **World Bank Procurement** | **国际招标**实时公告 | `src/lib/sources/wbprocurement.ts` |

映射配置都在 `ingest.ts`：企业↔Wikipedia 词条 `wikiMap`、行业↔OpenAlex 主题/HS 编码 `industryMap`、
城市↔OSM 边界框 `cityMap`。所有摄取数据均保留来源链接（维基百科、Wikidata 实体、官网、OpenAlex、
Comtrade、OSM）写入相应记录，满足「AI 分析保留来源引用」要求。

**摄取管线是幂等且容错的**：任一数据源临时失败/限流时保留库中已有数据，反复运行会累积各源的最优结果
（例如 Comtrade 的出口市场、Overpass 的工业区在多次运行间取最优）。

📖 详细文档：**[数据源说明](docs/DATA_SOURCES.md)** · **[开发过程](docs/DEVELOPMENT.md)** · **[运营手册](docs/OPERATIONS.md)** · **[OVH+CloudPanel 部署](docs/DEPLOYMENT_OVH_CLOUDPANEL.md)**

> 生产部署：项目已开启 `output: 'standalone'`；服务器上做完前置步骤后跑 `./deploy.sh --first` 一键部署（详见部署文档）。

真实数据展示位置：
- 首页「中国经济指标」→ **World Bank** 真实 GDP 增速 / CPI / GDP 总量 / FDI / 出口 / 人口（带年份与同比）
- 首页「人民币汇率」→ **Frankfurter/ECB** EUR/USD/GBP/JPY 对人民币，含 30 日走势图
- 城市页「省级 GDP 排行」→ **Wikidata SPARQL** 真实省级 GDP 条形榜
- 商机中心（新模块）→ **展会**（Wikidata，含官网）+ **招投标**（世行国际招标实时流 + 中国官方采购平台目录）
- 行业详情页 → 「研究趋势 · OpenAlex」柱状图 +「对外贸易 · UN Comtrade」出口额与出口市场
- 城市详情页 → 「工业区/园区 · OpenStreetMap」真实工厂/园区列表（点击跳转 OSM 地图）
- 企业详情页 → 三语简介、员工数、成立年份、「财务概览 · Yahoo Finance」（上市公司）、「专利 · Google Patents」、来源引用
- 首页 → 真实中国商业新闻

> **关于 Google Patents**：使用其非官方 xhr JSON 接口（无需 key）。Google 用 TLS 指纹拦截
> Node 的 fetch（返回 503），因此客户端改用 `curl`（Windows 10+/macOS/Linux 自带）并带指数退避重试。
> 短时间大量请求会触发临时 IP 限流，退避重试可自愈；下一次 `db:ingest` 会补齐。

> 下一步可继续接入：OpenCorporates（工商登记，需 token）、各省市政府公开数据、上市公司年报、CNIPA。

## AI 搜索与 RAG（向量检索增强生成）

AI 搜索/顾问不是纯生成——先**语义检索库内真实数据再作答并引用来源**：

1. **向量检索**：`src/lib/rag/retrieve.ts` 用 **pgvector** 对全库 60 条文档做余弦相似度检索；
   查询用**本地多语言 embedding 模型**（`Xenova/multilingual-e5-small`，384 维，transformers.js，**无需 key**）编码。
   词法打分作为兜底（模型/索引不可用时）。
2. **注入**：命中资料拼成上下文注入 DeepSeek 的 system prompt，指示「优先基于资料作答并用 `[n]` 标注」。
3. **引用**：检索到的来源通过 `data-sources` 流式部件回传前端，`ai-panel.tsx` 渲染为可点击的引用 chips。

**语义 + 跨语言实测**（`GET /api/retrieve?q=...`，均 `mode: vector`）：
- `电动车行业的领军公司` → 召回 CATL / BYD / 新能源汽车（数据里写的是「新能源汽车」而非「电动车」，纯语义匹配）
- `在中国卖化妆品要什么资质` → 召回 CCC 认证 / WFOE / 商标 攻略（无「化妆品」关键词，靠语义）
- 英文 `which Chinese city is best for a factory` → 召回 上海 / 深圳 / 杭州（库内是中文，跨语言命中）

**技术栈**：Postgres 用 `pgvector/pgvector:pg16` 镜像 + `vector(384)` 列 + HNSW 余弦索引；
embedding 由 `Xenova/multilingual-e5-small` 本地生成（首次自动下载 ~110MB 并缓存）。

```bash
npm run db:embed     # 从库内数据重建向量索引（rag_docs 表）
```

> 索引由 `db:setup` 自动构建。AI 最终作答需配置 `DEEPSEEK_API_KEY`。

## 其他能力

- **报告真实导出**：AI 报告/分析可一键导出 **Word（.docx）** 与 **PDF**（浏览器打印视图，中文渲染完美）。
- **知识图谱（真实数据）**：`/graph` 从库内企业↔行业↔城市↔竞争↔出口市场↔供应商关系自动生成力导向图谱，点击高亮关系网络。
- **真实地图**：Leaflet + OpenStreetMap，城市详情页标记真实工业区坐标（富士康/华为/中兴…），首页标记城市。
- **AI 工具调用**：模型可调用数据库工具获取**精确**数值（如"BYD 的市盈率"→直接查库返回准确值），与 RAG 上下文并用。
- **时间序列图表**：企业 5 年股价走势（Yahoo）、行业逐年出口额（UN Comtrade）、宏观指标近 12 年趋势（World Bank）。
- **对比分析**（`/compare`）：并排对比两家企业 / 两个行业的结构化指标 + AI 点评。
- **股权结构**：企业创始人 / 母公司 / 子公司（Wikidata），并接入知识图谱（35 节点含创始人/母子公司）。

## 后续路线图

- 接入真实数据源（国家企业信用信息公示系统、海关总署、UN Comtrade、Wikidata、GDELT…）替换种子数据
- 向量数据库 + RAG / 全文搜索
- NextAuth 鉴权 + 多租户 + 团队协作/审批/版本控制
- PDF / Word / PowerPoint 真实导出
- 多国家扩展 → Global Market Operating System (GMOS)
