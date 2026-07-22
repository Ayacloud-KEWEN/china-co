# 运营手册（Operations Manual）

面向**日常运营与维护** China MOS 平台的负责人。涵盖：环境配置、数据刷新与调度、
监控、备份、成本、数据治理与合规、故障处置、扩容与安全。部署相关见
[DEPLOYMENT_OVH_CLOUDPANEL.md](./DEPLOYMENT_OVH_CLOUDPANEL.md)。

---

## 1. 系统构成一览

| 组件 | 说明 | 进程/容器 |
|------|------|-----------|
| Web 应用 | Next.js（App Router）SSR + API | `next start`（PM2 常驻，端口 3200） |
| 数据库 | PostgreSQL 16 + pgvector | Docker 容器 `china-mos-db`（仅监听 127.0.0.1） |
| Embedding | transformers.js 本地模型（随 Web 进程） | 无独立进程 |
| LLM | DeepSeek API（外部） | 需 `DEEPSEEK_API_KEY`；含 RAG 检索 + 工具调用 |
| 账户 / 多租户 | 自建会话认证（scrypt + `sessions` 表 + cookie） | 随 Web 进程，无独立服务 |
| 数据摄取 | `db:ingest` / `db:embed`（离线批处理） | 手动或 cron |
| 行政区划 | `db:divisions` + `db:divisions:enrich`（3429 行，含人口/面积） | 随 `deploy.sh` 自动执行 |

外部依赖（均公开、无需付费 key，除 DeepSeek 外）：Wikipedia、Wikidata（含 SPARQL）、OpenAlex、
UN Comtrade、World Bank、World Bank Procurement、OpenStreetMap/Overpass、Google Patents、
Yahoo Finance、Frankfurter/ECB、Google News RSS。**账户与用户数据（关注/笔记/保存分析）不依赖任何外部服务**。

---

## 2. 环境变量

在 `.env.local`（或部署环境）配置：

| 变量 | 必需 | 说明 |
|------|:---:|------|
| `DATABASE_URL` | 是 | Postgres 连接串，如 `postgres://chinamos:***@localhost:5544/chinamos` |
| `DEEPSEEK_API_KEY` | AI 功能需要 | 无 key 时界面可完整浏览，仅 AI 生成会提示配置 |

> 密钥只放服务器环境，切勿提交仓库。`.env*` 已在 `.gitignore`。

---

## 3. 数据刷新与调度

平台数据分两类：

- **实时性强**（建议每日刷新）：新闻、汇率、宏观指标、国际招标。
- **变化慢**（每周/每月即可）：企业档案、行业、城市、省级 GDP、展会、专利、财务。
- **几乎不变**（每次部署顺带跑一次即可）：全国行政区划结构（`db:divisions`）。

### 刷新命令

```bash
npm run db:ingest     # 拉取全部 14 个真实数据源，幂等、容错（约 2–4 分钟）
npm run db:divisions         # 刷新全国行政区划结构（约 10 秒；不覆盖后台填写的区域情报）
npm run db:divisions:enrich  # 填人口/面积/英文名（约 3–5 分钟；已填满时秒退）
npm run db:embed      # 摄取后重建 RAG 向量索引（约 10 秒）
```

> **顺序很重要**：先 `db:ingest` 再 `db:embed`（向量基于最新数据）。
> `db:divisions` 与两者无依赖关系，`deploy.sh` 已在每次部署时自动执行，通常不必手动跑。

### 建议的定时任务（cron）

在服务器上（以应用所在用户）：

```cron
# 每天 03:30 刷新数据并重建向量索引（日志留存）
30 3 * * * cd /home/<siteuser>/htdocs/<domain> && /usr/bin/npm run db:ingest >> logs/ingest.log 2>&1 && /usr/bin/npm run db:embed >> logs/embed.log 2>&1
```

- **幂等保证**：任一源当次失败会保留库中已有数据，不会清空。
- **限流友好**：脚本内已对 Google News/Comtrade/Overpass/Patents 做节流与退避；勿把间隔设得过密。
- **Google Patents**：受 IP 限流影响，可能某几天补不到，属正常；下次成功运行自动补齐。

---

## 4. 数据治理与来源引用

- **来源可追溯**：每条摄取数据都写入来源链接（企业 `sources` 字段、行业/城市卡片底部、AI 引用 chips）。运营时**不得删除来源标注**。
- **准确性免责**：财务/汇率等标注「数据延迟，仅供参考，非投资建议」；政策/贸易数据标注来源与年份。请保持这些声明。
- **种子数据边界**：供应商、部分政策/新闻可能仍为示例数据（见开发文档「技术债」）。对外展示时注意区分。
- **多语言**：UI 与 AI 输出支持中/英/法；AI 输出语言跟随界面语言（`/api/chat` 的 `lang` 参数）。

---

## 5. 监控与日志

- **应用日志**：PM2 `pm2 logs china-mos`（stdout/stderr）。
- **摄取日志**：cron 输出到 `logs/ingest.log` / `logs/embed.log`。
- **数据库健康**：`docker exec china-mos-db pg_isready -U chinamos -d chinamos`。
- **快速数据体检**：
  ```bash
  docker exec china-mos-db psql -U chinamos -d chinamos -c \
   "select 'companies',count(*) from companies union all \
    select 'rag_docs',count(*) from rag_docs union all \
    select 'users',count(*) from users union all \
    select 'sessions',count(*) from sessions union all select 'fx',count(*) from fx;"
  ```
- **RAG 自检**：`curl 'http://127.0.0.1:3200/api/retrieve?q=新能源汽车'` → 应返回 `mode:"vector"` 且有命中。
- **关键健康指标**：Web 进程存活、DB 可连接、`rag_docs` 行数=文档数（当前 60）、`/api/retrieve` 返回 vector。
- **过期会话清理**（可选，加进每日 cron）：
  ```bash
  docker exec china-mos-db psql -U chinamos -d chinamos -c "delete from sessions where expires_at < now();"
  ```

---

## 6. 备份与恢复

**每日逻辑备份**（cron，保留 14 天）：

```bash
# 备份
docker exec china-mos-db pg_dump -U chinamos -d chinamos --format=custom \
  > backups/chinamos-$(date +%F).dump
find backups -name '*.dump' -mtime +14 -delete
```

**恢复**：

```bash
docker exec -i china-mos-db pg_restore -U chinamos -d chinamos --clean --if-exists \
  < backups/chinamos-YYYY-MM-DD.dump
```

- 数据卷 `china-mos-pgdata` 亦可整体快照（VPS 层面）。
- **注意**：恢复后如数据有变，跑一次 `npm run db:embed` 重建向量索引。

---

## 7. 成本

| 项 | 成本 |
|----|------|
| 14 个公开数据源 | **免费**（无 key） |
| Embedding（transformers.js 本地） | **免费**（仅占内存/CPU） |
| DeepSeek API | 按用量计费（中文便宜；仅 AI 问答/报告时产生） |
| VPS | 你现有 OVH VPS（与其他站点共用） |

**控成本要点**：AI 调用是唯一变动成本——RAG 已把上下文控制在数千字；如需进一步省，可降低 `topK`、缩短上下文、或对高频问答加缓存。

---

## 8. 安全与合规

- **数据库仅本机**：Postgres 容器只映射 `127.0.0.1`，不对公网开放。
- **密钥管理**：`DEEPSEEK_API_KEY` 只放服务器环境变量；定期轮换。
- **账户安全**：密码用 Node `scrypt` **加盐哈希**存储（`users.password_hash`，非明文）；会话为随机 32 字节 token 存 `sessions` 表，cookie 为 `httpOnly` + `sameSite=lax`，生产自动 `secure`（仅 HTTPS）。**务必在 HTTPS 下运行**（CloudPanel Let's Encrypt）。
- **用户数据 / PII**：现采集账户邮箱、姓名、团队名与用户笔记等 —— 属个人数据，需遵守隐私合规（GDPR 等）：提供注销/导出、最小化收集、明确用途。备份含这些数据，注意加密与访问控制。
- **多租户隔离**：用户数据按 `orgId`/`userId` 过滤；「共享给团队」仅在同 `orgId` 内可见。变更查询时务必保留这些过滤条件。
- **出站合规**：摄取只读取公开数据并保留来源；遵守各源使用条款（如 OSM ODbL 署名、Wikidata CC0、Yahoo 仅供参考）。
- **AI 输出**：属生成内容，运营应保留「仅供参考、需核实」的提示，尤其涉及财务/政策/投资。

---

## 9. 故障处置速查

| 现象 | 排查 |
|------|------|
| 页面 500 / 数据为空 | DB 是否运行：`docker ps`；连接串是否正确；`pg_isready` |
| AI 报「DEEPSEEK_API_KEY 未配置」 | 环境变量未加载；重启 Web 进程使 `.env.local` 生效 |
| `/api/retrieve` 返回 `mode:"lexical"` 或空 | `rag_docs` 为空或扩展缺失：跑 `npm run db:embed`；确认 `CREATE EXTENSION vector` |
| 首个 AI 请求很慢 | Embedding 模型冷启动（首次下载/加载），属正常，之后常驻 |
| 某数据源今天没更新 | 该源限流（尤其 Patents/GDELT）；下次成功运行自动补，无需干预 |
| 摄取报错中断 | 查 `logs/ingest.log`；幂等，可直接重跑 `npm run db:ingest` |
| 内存偏高 | Embedding 模型常驻（正常）；如紧张可增内存或改用更小模型 |
| 登录后立刻掉登录 / cookie 不生效 | 确认走 HTTPS（生产 cookie 为 `secure`）；反代是否透传；系统时间是否正确（会话按 `expires_at`） |
| 注册/登录报错 | 查 `users`/`sessions` 表是否存在（`drizzle-kit migrate` 是否应用 `0008`）；`pm2 logs` 看 Server Action 错误 |
| 「保存分析/关注」提示请先登录 | 未登录或会话过期；重新登录。数据按用户隔离，换账户看不到彼此私有数据（团队共享除外） |

---

## 10. 变更与发布流程

1. 本地改代码 → `npm run build` 通过 → 提交。
2. 服务器 `git pull` → `npm ci` → `npm run build`。
3. 若改了 `schema.ts`：`npm run db:generate` + `npm run db:migrate`（或 `db:push`）。
4. 若改了数据/摄取逻辑：`npm run db:ingest`（视情况）+ `npm run db:embed`。
5. `pm2 restart china-mos` → 冒烟测试（首页、一个企业页、`/api/retrieve`）。

详细部署步骤见 [DEPLOYMENT_OVH_CLOUDPANEL.md](./DEPLOYMENT_OVH_CLOUDPANEL.md)。

---

## 11. 扩容与演进（路线图）

已完成：✅ 鉴权 + 多租户、✅ 关注/笔记/保存分析、✅ Word/PDF 导出、✅ AI 工具调用、
✅ 时间序列图表、✅ 对比分析、✅ 股权图谱、✅ 真实地图。

后续：

- **团队协作**：邀请成员、角色权限、审批流（咨询工作台完整化）；PPT 导出。
- **商业化**：订阅计费（Stripe）+ AI 用量计量/限流。
- **政策提醒**：关键词订阅 → 邮件推送（需接邮件服务如 Resend）。
- **检索增强**：混合检索（向量+词法加权）、命中高亮、rerank。
- **更多真实源**：供应商/政策实时化、上市公司年报 PDF 解析、各省市开放数据。
- **数据库托管**：数据量增大后可迁移到托管 Postgres（Neon/Supabase，改 `DATABASE_URL` 即可）。
