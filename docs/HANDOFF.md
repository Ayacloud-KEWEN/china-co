# 接续文档 / Handoff（在新 session 从这里继续）

本文件是**单一入口**：新会话读完它就能接着开发/运营 China MOS。
配套细节见：[数据源](./DATA_SOURCES.md) · [开发过程](./DEVELOPMENT.md) · [运营手册](./OPERATIONS.md) · [部署](./DEPLOYMENT_OVH_CLOUDPANEL.md)。

> 给新 session 的提示词模板见文末「如何在新会话继续」。

---

## 1. 项目一句话

**China MOS** = AI 驱动的企业级「中国市场操作系统」，面向欧洲企业进入/经营中国市场。
Next.js 16（App Router）+ PostgreSQL/pgvector + Drizzle + DeepSeek，14 个免 key 公开数据源摄取进库，
向量 RAG + 工具调用问答，账户/多租户，报告导出，图谱/地图/时间序列/对比。

## 2. 关键坐标

| 项 | 值 |
|---|---|
| 仓库 | `https://github.com/Ayacloud-KEWEN/china-co.git`（默认分支 `main`） |
| 本地开发端口 | 3000（`npm run dev`） |
| 生产域名 / 端口 | `china.francego.fr` / **3200** |
| 生产环境 | OVH VPS + CloudPanel（Node.js 站点 + Nginx 反代 + Cloudflare + Let's Encrypt） |
| 数据库 | Postgres 16 + pgvector，Docker 容器 `china-mos-db`，仅绑 `127.0.0.1:5544` |
| 进程 | PM2 跑 `next start`（**不是** standalone），名字 `china-mos` |
| 最新提交（写档时） | `7dfa81c`（部署稳定版） |

## 3. 现状：已完成

**16 个模块**：首页 / AI 搜索 / 企业 / 行业 / 城市 / 供应链 / 政策 / 商机中心 / Playbooks /
知识图谱 / 对比分析 / AI 顾问 / 报告生成 / 咨询工作台 / 我的空间 / 登录·注册。

**14 个真实数据源**（全部免 key，摄取进库）：Wikipedia、Wikidata(实体+SPARQL)、Google News、GDELT、
OpenAlex、UN Comtrade、OpenStreetMap/Overpass、Google Patents、World Bank、World Bank Procurement、
Yahoo Finance、Frankfurter/ECB。

**数据真实性现状**：新闻、宏观指标、汇率、省份 GDP、展会、招标全为真实摄取；企业概述/成立/员工/专利/财务/股价/股权、行业论文+贸易、城市地图 POI 均真实；**城市人口/GDP**（Wikidata，GDP 有单位护栏、缺失则保留种子）、**企业 growth**（Yahoo 营收增速，限上市）已真实化。**仍为种子/后台维护**：供应商、政策（无免费 API，改由 `/admin` 人工维护），以及企业 `riskScore`（自定义评分）、行业 `marketSize`、城市 `pillars`/`leaders` 等无干净免费源的字段。

**攻略中心已做实**（迁移 `drizzle/0012`）：playbooks 加结构化字段（`summary`/`steps`/`documents`/`departments`/`risks`/`tips`/`faq`/`relatedCities`/`sourceUrl`），6 篇内置攻略（WFOE/市场进入/找ODM/CCC/小红书/商标）已填**真实分步流程 + 所需材料 + 涉及部门 + 风险 + FAQ + 官方依据**（内容在 `src/lib/data.ts`）。详情页富展示（步骤时间线/清单/FAQ），列表卡片显示概述与步骤数，并接入 `/admin/playbooks` 增删改查。**注意**：内置内容通过 `db:seed` 写入，生产更新用 `./deploy.sh --refresh`（会重新 seed 基础内容并重新 ingest，用户数据不受影响）。

**全国行政区划已接入**（迁移 `drizzle/0013`）：新增 `divisions` 表（自引用：`code`/`parent_code`/`level`），
由 `npm run db:divisions` 从国标区划代码（GB/T 2260）公开数据集导入 **31 省 / 342 地级市 / 3056 区县 = 3429 行**（不含港澳台）。
`/cities` 底部为可展开+可搜索的区划树，点击进 `/cities/area/[code]`（面包屑 + 下辖区域 + 已填情报）；
填了 `city_slug` 的节点直接跳转到对应的完整城市情报页。后台 `/admin/divisions` 支持逐级下钻/搜索/「只看已填写」，
逐个填写 GDP、人口、支柱产业、三语概述、备注。
**关键点**：导入是 upsert，**只刷新结构与名称，不覆盖后台填写的情报**，可随部署反复运行（`deploy.sh` 已内置）；
表结构支持任意层级，扩展到乡镇街道只需换数据源重跑，**无需改 schema**。

**能力**：
- 向量 RAG（pgvector + 本地 `multilingual-e5-small` embedding）+ **AI 工具调用**（精确查库）+ 引用来源
- 报告 **Word/PDF 导出**（`/api/export/docx` + 打印视图）
- **时间序列**：企业 5 年股价、行业逐年出口、宏观 12 年趋势
- **对比分析** `/compare`；**知识图谱**（真实关系 + 力导向 + 股权）；**真实地图**（Leaflet/OSM）
- **账户 + 多租户**（自建 scrypt 会话）+ **关注/笔记/保存分析（团队共享）** + `/me`
- 三语（中/英/法）+ 深色模式 + 响应式

**数据库**：19 张表（情报 13 + 账户/用户数据 6），迁移 `drizzle/0000–0008`。

## 4. 关键文件地图

```
src/app/
  layout.tsx                 根布局（读当前用户 getCurrentUser）
  page.tsx / home-view.tsx   首页
  api/chat/route.ts          DeepSeek 流式 + RAG 注入 + 工具调用
  api/retrieve/route.ts      RAG 检索端点（验证用）
  api/export/docx/route.ts   Word 导出
  actions/auth.ts            登录/注册/退出 Server Actions
  actions/user-data.ts       关注/笔记/保存分析 Server Actions
  <模块>/page.tsx(server) + *-view.tsx(client)   每个情报模块的取数/渲染分离
src/lib/
  data.ts                    种子数据（加企业从这里改）
  queries.ts                 服务端查询层
  auth.ts / user-data.ts     会话认证 / 用户实体状态（server-only）
  graph.ts                   知识图谱构建
  rag/{corpus,embed,retrieve,tools}.ts   RAG 语料/嵌入/检索/工具
  sources/*.ts               13 个数据源客户端
  export/markdown-to-docx.ts 报告 docx 生成
src/db/
  schema.ts                  19 张表 + 行类型
  seed.ts / ingest.ts / embed.ts   种子 / 摄取编排 / 向量索引
deploy.sh                    一键部署（migrate+build+embed+PM2）
docker-compose.yml           pgvector 容器 + init.sql 建扩展
```

## 5. 部署速记 + 已知坑（重要！都是踩过的）

生产用 `./deploy.sh`（更新）或 `./deploy.sh --first`（首次含种子+摄取）/ `--refresh`（含重新摄取）。
以下每一条都是排障血泪，**改部署相关代码时务必保留**：

1. **构建必须用 webpack**：`build` 脚本是 `next build --webpack`。Next 16 的 **Turbopack 生产构建在该 Linux 上不写 CSS chunk**，导致 `/_next/static/*` 全 500。webpack 把 CSS 落到 `.next/static/css/`。
2. **用 `next start`，不用 standalone**：`output:'standalone'` 已移除。standalone + Turbopack 伺服静态会 500，且原生 embedding 库缺失。`next start` 用完整 node_modules，稳。
3. **PM2 必须 `--cwd "$ROOT"`**：否则 pm2 从 dump 恢复出**旧的工作目录**，`next start` 读到**旧 `.next`**，服务永远发老 HTML（引用不存在的旧 chunk）→ 静态 500。deploy.sh 已 `pm2 delete` 后带 `--cwd` 重建。
4. **构建前 `rm -rf .next`**：避免脏 manifest/static 不一致。deploy.sh 已做。
5. **npm ci 要含 devDeps**：deploy.sh 用 `npm ci --include=dev`（build 和 db 脚本需要 drizzle-kit/tsx/tailwind/typescript）。**别在 install/build 前设 `NODE_ENV=production`**（会跳过 devDeps）。
6. **schema 用 migrate 不用 push**：`drizzle-kit push` 在生产会卡在 "Pulling schema"。用 `drizzle-kit migrate`（deploy.sh 已用）。
7. **端口只绑本机**：Postgres `127.0.0.1:5544`；应用 `127.0.0.1:3200`，防火墙只开 80/443/22/8443。
8. **CloudPanel 反代**：需 `proxy_buffering off;` + `proxy_read_timeout 300s;`（AI 流式）。
9. **Cloudflare 必须绕过 HTML 缓存**：动态 SSR 站，否则重新部署后旧 HTML 被缓存 → 引用旧 chunk → 静态 500。规则：`URI Path 不以 /_next/static/ 开头` → Bypass cache；部署后 Purge Everything。
10. **排障有孤儿进程时**：`pm2 kill` + `sudo fuser -k 3200/tcp` + `pkill -f next-server` 清干净，再 `./deploy.sh`。

**当前待办（生产）**：`.env.local` 的 `DEEPSEEK_API_KEY` 还是占位符 `sk-...here` → AI 问答/报告不可用，**填真实 key 后 `pm2 restart china-mos --update-env`**。

## 6. 常见运营操作

**加一家新企业**（推荐用管理后台）：登录管理员账号 → `/admin/companies` → 新增；行业/城市同理。基础字段即时生效；点「重建向量索引」让其进入 AI 检索。

**加一家新企业（命令行方式，同时补增强数据）**（详见 [OPERATIONS](./OPERATIONS.md)）：
1. `src/lib/data.ts` 的 `companies` 数组加一条；
2. `src/db/ingest.ts` 的 `wikiMap`/`patentAssignee`/`stockSymbol` 加映射；
3. `npm run db:seed && npm run db:ingest && npm run db:embed`（不动用户数据；页面动态读库，无需重启/重构建）。

**刷新真实数据**：`npm run db:ingest && npm run db:embed`（幂等，建议每日 cron，见 OPERATIONS 第 3 节）。

**填写行政区情报**：`/admin/divisions` → 下钻或搜索到目标区县 → 编辑。前台 `/cities` 区划树与
`/cities/area/[code]` 立即读库生效，无需重启或重建。

**备份**：`pg_dump`（OPERATIONS 第 6 节）。

## 7. 路线图（带优先级）

### 一线 · 让产品可运营/可卖
- [x] **管理后台（自助录入企业/数据）** ✅ 已完成：`/admin` 控制台。仪表盘（各表计数）+ **企业/行业/城市/政策/供应商/攻略**的增删改查 + **行政区划**情报录入（结构只读）（网页表单，无需改 `data.ts`）+ 一键重建向量索引（`db:embed`）。
  - **鉴权**：`ADMIN_EMAILS`（逗号分隔邮箱，见 `.env.local.example`）或 `users.is_admin` 字段。生产需在 `.env.local` 设 `ADMIN_EMAILS` 并 `pm2 restart china-mos --update-env`。
  - **迁移**：`is_admin` 列（`drizzle/0009`）；信息丰富字段（`drizzle/0010`，见下）。生产 `./deploy.sh` 的 `migrate` 会自动应用。
  - 关键文件：`src/app/admin/*`、`src/app/actions/admin.ts`、`src/lib/admin.ts`。
  - 增强字段（专利/财务/股价/股权、研究/贸易、地图 POI）仍由 `db:ingest` 填充，后台不编辑；如需让新企业进入 AI 检索，点后台「重建向量索引」。
- [x] **信息丰富化（第一批）** ✅ 已完成（迁移 `drizzle/0010`）：
  - **政策**：加 `summary`(三语摘要) / `sourceUrl`(原文) / `region`(适用范围) / `effectiveDate`(生效日)，后台可录入，`/policy` 展示。
  - **新闻**：加 `url`(原文链接) + `entityType`/`entitySlug`(实体关联)。`db:ingest` 自动填充：新闻标题按企业/行业/城市名（含英文名首词）**自动关联**；首页新闻可点击。企业/城市详情页新增「相关动态」区。
  - **企业**：加 `executives`(高管，后台「姓名 | 职务」录入，详情页展示)。
  - **城市**：加 `officeRent`/`avgWage`/`fdi`(营商成本，后台录入，详情页「营商成本」区)。
  - 新闻是「删表重插」（每次 `db:ingest` 刷新），故走自动摄取而非后台录入；政策/企业/城市走后台录入。
- [x] **政策订阅提醒 + 站内通知** ✅ 已完成（迁移 `drizzle/0011`）：
  - 用户在 `/me`「政策订阅」录入关键词；管理员发布新政策时按关键词（匹配三语标题/摘要/标签）自动 fan-out 站内通知。
  - 顶栏铃铛显示未读角标 + 下拉列表（点开原文、单条/全部已读）。通知按 `(user_id, ref_key)` 去重，避免重复推送。
  - 邮件为**可选**：设 `RESEND_API_KEY` + `ALERT_FROM_EMAIL` 即通过 Resend 发送；未设则仅站内通知（开箱可用）。
  - 关键文件：`src/lib/notifications.ts`、`src/lib/email.ts`、`src/app/actions/notifications.ts`、`src/components/notification-bell.tsx`。
  - 后续可扩展：新闻→关注实体的通知（实体关联已就绪）、关注对象订阅、通知中心整页。
- [ ] **团队邀请 + 协作**：邮件邀请成员、角色权限、共享项目、评论、审批流（把已有多租户地基用起来，完善"咨询工作台"）。
- [ ] **订阅计费（Stripe）**：套餐分层 + AI 用量计量/限流。

### 二线 · 分析深度与体验
- [ ] AI 报告工作台（可编辑大纲/分节重生成/版本）
- [ ] PPT 导出（pptxgenjs，补齐三件套）
- [ ] 搜索增强（企业名自动补全、筛选、历史、混合检索+rerank）
- [ ] 通知/动态流（关注对象有新新闻/政策/财报变动）
- [ ] 更多真实源（真实供应商、企业级实时新闻、财报历史、CNIPA）
- [ ] 行业基准仪表盘（多企业多指标对标）
- [ ] 对外 API（B2B 卖点）

### 三线 · 工程与合规
- [ ] 可观测性（Sentry）+ AI 按用户/套餐限流 + 访问分析
- [ ] GDPR：用户数据导出/注销（已采集邮箱/姓名/笔记等 PII）
- [ ] 全站三语补全（部分组件中文硬编码）、CI/CD、自动化测试

## 8. 如何在新会话继续

在新 session 里，可以这样开场（把下面这段发给我）：

> 继续开发 China MOS（仓库 github.com/Ayacloud-KEWEN/china-co，本地在 `C:\Users\pc\OneDrive\MyWebsites\china-co`）。
> 先读 `docs/HANDOFF.md` 了解现状、部署坑和路线图。这次我想做【路线图里的某一项，例如"管理后台"】。

新 session 起步动作建议：
1. 读 `docs/HANDOFF.md`（本文件）→ 再按需读 DEVELOPMENT/OPERATIONS/DATA_SOURCES。
2. 本地起环境：`npm install` →（Docker Desktop 开着）`npm run db:setup` → `npm run dev`。
3. 改完 `npm run build` 通过 → `git push` → VPS `git pull && ./deploy.sh`。
4. **切记第 5 节的部署坑**（webpack / next start / pm2 --cwd / rm -rf .next / Cloudflare）。

---

**给新 session 的最重要一句**：部署问题几乎都指向第 5 节那 10 条；功能开发从第 7 节路线图挑，推荐从**管理后台**入手。
