# 数据源说明文档（Data Sources）

China MOS 的所有情报数据来自**公开、免费、无需付费 API Key** 的数据源。
本文档详细说明每个数据源：接口、字段、落库位置、展示页面、限流与容错策略。

> 摄取入口：`src/db/ingest.ts`（`npm run db:ingest`）。所有源客户端在 `src/lib/sources/`。
> 设计原则：**幂等 + 容错** —— 任一源临时失败/限流时保留数据库已有数据，反复运行累积各源最优结果。

---

## 总览

| # | 数据源 | 提供方 | 需要 Key | 客户端 | 落库位置 | 展示页面 |
|---|--------|--------|:---:|--------|----------|----------|
| 1 | Wikipedia REST | Wikimedia | 否 | `sources/wikipedia.ts` | `companies.overview` (三语) | 企业详情 |
| 2 | Wikidata | Wikimedia | 否 | `sources/wikidata.ts` | `companies.founded / employees / sources` | 企业详情 |
| 3 | Google News RSS | Google | 否 | `sources/googlenews.ts` | `news` 表 | 首页 |
| 4 | GDELT 2.0 Doc | GDELT Project | 否 | `sources/gdelt.ts` | `news` 表（备用源） | 首页 |
| 5 | OpenAlex | OpenAlex | 否 | `sources/openalex.ts` | `industries.research` | 行业详情 |
| 6 | UN Comtrade | 联合国 | 否（preview） | `sources/comtrade.ts` | `industries.trade` | 行业详情 |
| 7 | OpenStreetMap / Overpass | OSM | 否 | `sources/overpass.ts` | `cities.geo / pois` | 城市详情 |
| 8 | Google Patents | Google | 否 | `sources/googlepatents.ts` | `companies.patents` | 企业详情 |
| 9 | World Bank Open Data | 世界银行 | 否 | `sources/worldbank.ts` | `indicators` 表 | 首页 |
| 10 | Yahoo Finance | Yahoo | 否（crumb） | `sources/yahoo.ts` | `companies.financials` | 企业详情 |
| 11 | Frankfurter (ECB) | Frankfurter | 否 | `sources/frankfurter.ts` | `fx` 表 | 首页 |
| 12 | Wikidata SPARQL（省级 GDP） | Wikimedia | 否 | `sources/wikidata-sparql.ts` | `provinces` 表 | 城市 |
| 13 | Wikidata SPARQL（展会） | Wikimedia | 否 | `sources/wikidata-sparql.ts` | `fairs` 表 | 商机中心 |
| 14 | World Bank Procurement | 世界银行 | 否 | `sources/wbprocurement.ts` | `tenders` 表 | 商机中心 |

---

## 1. Wikipedia REST — 企业三语简介

- **接口**：`https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`（lang = `zh` / `en` / `fr`）
- **返回**：`extract`（摘要文本）、`wikibase_item`（对应 Wikidata QID）、`content_urls.desktop.page`
- **用途**：为每家企业生成**中/英/法**真实简介，写入 `companies.overview` JSONB。
- **映射**：`ingest.ts` 的 `wikiMap`（slug → 各语言词条标题）。找不到词条时回退到种子文本。
- **注意**：需带 `User-Agent`；`type === "disambiguation"` 的消歧义页跳过。

## 2. Wikidata — 结构化事实

- **接口**：`https://www.wikidata.org/wiki/Special:EntityData/{QID}.json`
- **提取字段**：
  - `P571` 成立时间 → `companies.founded`
  - `P1128` 员工数 → `companies.employees`
  - `P856` 官网 → 追加到 `companies.sources`
- **QID 来源**：由 Wikipedia summary 的 `wikibase_item` 自动获得（无需硬编码 QID）。
- **示例结果**：BYD 员工 194,000、CATL 83,601、Huawei 180,000（真实）。

## 3. Google News RSS — 首页新闻（主源）

- **接口**：`https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en`
- **解析**：返回 RSS/XML，用轻量正则解析 `<item>`（无第三方 XML 库），提取标题、`<source>`、`pubDate`、link。
- **处理**：Google 会在标题追加 “ - 来源名”，解析时剥离得到干净标题；`pubDate` 转相对时间（`3h` / `2d`）。
- **落库**：清空并重写 `news` 表（8 条）。

## 4. GDELT 2.0 Doc API — 新闻备用源

- **接口**：`https://api.gdeltproject.org/api/v2/doc/doc?query=...&mode=artlist&format=json`
- **限流**：**1 次 / 5 秒**，超限返回纯文本提示（非 JSON），客户端据此判空。
- **角色**：仅当 Google News 返回空时作为 fallback。实测该 API 对数据中心 IP 限流较激进，故降级为备用。

## 5. OpenAlex — 行业研究趋势

- **接口**：`https://api.openalex.org/works?filter=title.search:{query}&group_by=publication_year`
- **返回**：`meta.count`（论文总数）+ 按年分组计数。
- **落库**：`industries.research` = `{ query, total, series:[{year,count}] }`（近 6 年）。
- **映射**：`ingest.ts` 的 `industryMap[slug].openAlex`（如 NEV → `electric vehicle`）。
- **示例**：新能源汽车 100,431 篇、动力电池 84,373 篇、半导体 32,630 篇。

## 6. UN Comtrade（preview）— 对外贸易

- **接口**：`https://comtradeapi.un.org/public/v1/preview/C/A/HS`（**preview 端点无需 Key**）
- **参数**：`reporterCode=156`（中国）、`flowCode=X`（出口）、`cmdCode={HS}`、`partnerCode=0`（全球）或伙伴国代码逗号列表。
- **提取**：`primaryValue`（美元出口额）。伙伴国按额排序取 Top 5。
- **落库**：`industries.trade` = `{ hs, year, exportUSD, topPartners:[{name,valueUSD}] }`。
- **映射**：`industryMap[slug].hs`（如 NEV → HS 87；电池 → 8507；半导体 → 8542）。
- **注意**：preview 端点**间歇性只返回全球汇总、不返回伙伴国明细** → 采用「跨运行保留最优伙伴列表」策略。
- **时间序列**：`getChinaExportSeries(hs, years)` 逐年取（preview 单次仅一个 period）→ `industries.trade.history`，行业页「逐年出口额」柱状图。
- **示例**：2023 中国车辆(HS 87)出口全球 $192.5B；半导体 $136.3B。

## 7. OpenStreetMap / Overpass — 城市工业区

- **接口**：`https://overpass-api.de/api/interpreter`（POST Overpass QL）
- **查询**：城市 bbox 内 `landuse=industrial` 且带 `name` 的 node / way，取 center 坐标。
- **落库**：`cities.geo`（中心点）+ `cities.pois`（`[{name,lat,lon}]`）。
- **映射**：`ingest.ts` 的 `cityMap[slug]` = `[south, west, north, east]`。
- **注意**：**Nominatim（地理编码）封禁数据中心 IP**，故城市坐标用固定 bbox，不走 Nominatim；深圳 bbox 收紧到 22.52°N 以北以排除香港。Overpass 单次调用偶发丢结果，靠「非空才覆盖」保留最优。
- **示例**：深圳→富士康 / 华为 / 中兴 / 盐田港；上海→宝钢 / 江南造船厂 / 振华重工。

## 8. Google Patents — 企业专利

- **接口**（非官方 xhr JSON）：`https://patents.google.com/xhr/query?url=assignee%3D{name}&exp=`
- **返回**：`total_num_results`（专利总数）+ Top 结果（`id` / `title`）。
- **落库**：`companies.patents` = `{ assignee, total, top:[{number,title,url}], searchUrl }`。
- **映射**：`ingest.ts` 的 `patentAssignee[slug]`。
- **重要坑**：Google 用 **TLS 指纹拦截 Node 的 fetch（返回 503）** → 客户端改用 **curl** 抓取（Windows 10+/macOS/Linux 自带）。此外短时间高频请求会触发**临时 IP 限流**，客户端带**指数退避重试**（5s/10s）自愈；某 IP 被会话级封禁时，下次 `db:ingest` 在非受限环境自动补齐。
- **首次实测**：Huawei 124,922 项、BYD EV 专利可正常获取。

## 9. World Bank Open Data — 宏观指标

- **接口**：`https://api.worldbank.org/v2/country/CHN/indicator/{code}?format=json&mrv=2`
- **指标**（`ingest.ts` 的 `wbIndicators`）：
  - `NY.GDP.MKTP.KD.ZG` GDP 增速、`FP.CPI.TOTL.ZG` CPI
  - `NY.GDP.MKTP.CD` GDP 总量、`BX.KLT.DINV.CD.WD` FDI
  - `NE.EXP.GNFS.CD` 出口、`SP.POP.TOTL` 人口
- **落库**：清空并重写 `indicators` 表，含**最新年份**与**同比**（百分点或 %），带涨跌方向。
- **时间序列**：`getIndicatorSeries(code, 12)`（`mrv=12`）→ `indicators.series`，首页每个指标卡的近 12 年 sparkline。
- **示例**：GDP 增速 5.0% (2025)、GDP 总量 $19.50T、出口 $4.11T、人口 1.41B。

## 10. Yahoo Finance — 上市公司财务

- **接口**：`https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}?modules=price,summaryDetail,financialData,defaultKeyStatistics`
- **鉴权**：需 **cookie + crumb 握手**：
  1. `GET https://fc.yahoo.com/` 播种 cookie jar；
  2. `GET .../v1/test/getcrumb` 取 crumb；
  3. 带 cookie + `crumb` 请求 quoteSummary。
- **实现**：Node fetch 的 cookie/数据中心校验不稳 → 用 **curl + cookie jar** 实现（`sources/yahoo.ts`）。
- **提取**：市值、股价、涨跌%、P/E、P/B、EPS、52 周区间、营收(TTM)、营收增速、毛利率、净利率、ROE。
- **落库**：`companies.financials`；仅上市公司（`ingest.ts` 的 `stockSymbol`：BYD 002594.SZ、CATL 300750.SZ、Mindray 300760.SZ）。
- **时间序列**：`getPriceHistory(symbol)` 用 v8 chart（`range=5y&interval=1mo`，无需 crumb）取近 5 年月度收盘 → `companies.price_history`，企业页「股价走势」折线图。
- **坑**：curl 参数 `-o /dev/null` 在 Node 调起的 mingw curl 下会破坏整个流程 → 去掉即成功。
- **示例**：CATL 市值 ¥1.79T、P/E 22.1、ROE 25.4%；BYD 市值 ¥7,707 亿、营收 ¥7,838 亿。
- **合规**：页面标注「数据延迟，仅供参考，非投资建议」。

## 11. Frankfurter（ECB）— 人民币汇率

- **接口**：`https://api.frankfurter.dev/v1/{start}..{end}?base={CUR}&symbols=CNY`（数据源为欧洲央行参考汇率）
- **返回**：区间内每日汇率，用于计算「1 CUR = N CNY」+ 30 日变化 + sparkline。
- **落库**：`fx` 表（EUR / USD / GBP / JPY，各含 `cnyPer` / `changePct` / `spark[]` / `date`）。
- **展示**：首页「人民币汇率 · 30 日走势」卡片，含迷你走势图（面向欧洲用户）。
- **示例**：1 EUR ≈ ¥7.73、1 USD ≈ ¥6.80、1 GBP ≈ ¥9.00。

## 12. Wikidata SPARQL — 省级 GDP

- **接口**：`https://query.wikidata.org/sparql`（SPARQL，无需 Key）
- **查询**：`?prov wdt:P31 wd:Q1615742`（中国省级行政区）+ `MAX(P2131)`（名义 GDP）分组，按 GDP 降序。
- **落库**：`provinces` 表（`name` / `gdpCny` / `rank`）。
- **展示**：城市页「省级 GDP 排行」条形榜。
- **注意**：用 `MAX` 聚合折叠同一省份多个 point-in-time 值；过滤掉未解析标签（`Q\d+`）。
- **示例**：广东 ¥12.44T、江苏 ¥10.27T、山东 ¥8.31T、浙江 ¥7.35T（真实，年份以 Wikidata 为准）。

## 13. Wikidata SPARQL — 展会

- **查询**：`?fair wdt:P31 wd:Q57305`（trade fair）+ `wdt:P17 wd:Q148`（国家=中国），带 `P856` 官网、`P276` 地点。
- **落库**：`fairs` 表（`name` / `website` / `city`）。
- **展示**：商机中心「重点展会」卡片。
- **示例**：广交会、进博会、珠海航展、服贸会、北京国际设计周（真实，含官网链接）。
- **股权/子公司**：`getOwnership(qid)` 取 P112 创始人 / P749 母公司 / P355 子公司 → `companies.ownership`，企业页「股权结构」卡片 + 知识图谱。示例：BYD 创始人吕向阳 + 4 子公司；华为 任正非 + 8 子公司。

## 14. World Bank Procurement Notices — 国际招标

- **接口**：`https://search.worldbank.org/api/v2/procnotices?format=json&sort=noticedate&order=desc`
- **返回**：世行融资项目的真实招标公告（Invitation for Bids / Request for EOI / Contract Award），含类型、国别、发布/截止日期。
- **落库**：`tenders` 表。
- **展示**：商机中心「国际招标机会 · 世界银行采购」实时列表。
- **重要说明**：**中国境内招投标没有免费开放 API**（该接口的国别过滤对中国无效，返回全球数据）。因此本模块诚实地采用「**真实全球世行招标实时流** + **中国官方采购平台直达目录**」的组合：
  - 官方平台目录（真实深链，硬编码于 `opportunities-view.tsx` 的 `cnProcurement`）：中国政府采购网 `ccgp.gov.cn`、中国招标投标公共服务平台 `cebpubservice.com`、全国公共资源交易平台 `ggzy.gov.cn`、中央政府采购网 `zycg.gov.cn`。

---

## 数据来源与引用

所有摄取数据都保留来源链接写入相应记录（企业 `sources` 字段含维基百科、Wikidata 实体、官网、Google Patents、Yahoo Finance；行业/城市卡片底部标注 OpenAlex / UN Comtrade / OpenStreetMap 来源），满足产品规格「所有 AI 分析必须保留来源引用」的要求。

## 账户与用户数据（非外部源）

账户体系（`organizations` / `users` / `sessions`）与用户数据（`watchlist` / `notes` / `saved_analyses`）
**不来自外部数据源**，由用户在应用内产生，存于 Postgres。认证为自建会话（Node `scrypt` 哈希 + httpOnly cookie），
无需任何外部 API Key。详见 [DEVELOPMENT.md](./DEVELOPMENT.md) 阶段七。

## 行政区划（独立于 `db:ingest`）

| 数据源 | 用途 | 脚本 |
| --- | --- | --- |
| **国标行政区划代码（GB/T 2260）公开 JSON 数据集** | `divisions` 表：31 省 / 342 地级市 / 3056 区县的名称与上下级结构，驱动 `/cities` 区划树与 `/admin/divisions` | `src/db/divisions.ts`（`npm run db:divisions`） |
| **Wikidata SPARQL（P442 区划代码）** | 各级**人口**(P1082) / **面积**(P2046) / 英文名，按区划代码精确匹配 | `getDivisionStats()` in `src/lib/sources/wikidata-sparql.ts`（`npm run db:divisions:enrich`） |

- 独立于摄取流程：行政区划结构一年才变几次，不必跟着每日 `db:ingest` 跑。
- `db:divisions` **只写结构**（`name` / `parent_code` / `level`）。
- `db:divisions:enrich` 填 **人口 / 面积 / 英文名**，覆盖率：省 100%、地级市 97%、区县 94%；
  **默认只填空白**，后台手改的值不被覆盖（`-- --force` 强制刷新）；无对应条目的约 6% 保持空白，不猜测。
- **GDP 无免费源**：全 Wikidata 带区划代码又有 P2131 的条目不足 40 个。区县 GDP 只能人工录入；
  省级 GDP 走独立的 `provinces` 表。**支柱产业 / 概述**同样无结构化源，需人工填写。
- 表为自引用结构，扩展到乡镇街道只需换数据源重跑，无需改 schema。
- 不含港澳台（数据集本身不含），如需可在后台手工补。

## 尚未接入（下一步候选）

OpenCorporates（工商登记，需 token）、CNIPA（专利，无开放 API）、中国境内招投标实时流（无免费开放 API，目前用官方平台目录代替）、上市公司年报原文（PDF 解析）。

## 刷新数据

```bash
npm run db:ingest        # 刷新全部真实数据源（幂等，可反复运行）
npm run db:divisions     # 刷新全国行政区划结构（幂等，不覆盖后台填写内容）
npm run db:embed         # 数据变更后重建 RAG 向量索引（pgvector / rag_docs）
```

单独调试某个源：参考 `src/db/ingest.ts` 中对应段落，或临时写一次性脚本调用 `src/lib/sources/*` 的导出函数。
