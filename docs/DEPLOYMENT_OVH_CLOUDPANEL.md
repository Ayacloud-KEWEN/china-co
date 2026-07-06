# 部署指南：OVH VPS + CloudPanel

把 China MOS 部署到你的 **OVH VPS**（用 **CloudPanel** 管理，且已托管其他网站）。
方案要点：作为**独立站点**接入，不影响现有站点——独立 vhost、独立系统用户、
**独享一个应用端口**、Postgres 只监听本机、防火墙不新开对外端口。

> 读前先了解整体运行方式见 [OPERATIONS.md](./OPERATIONS.md)，架构见 [DEVELOPMENT.md](./DEVELOPMENT.md)。

---

## 0. 架构（部署后）

```
Internet ──443──► CloudPanel(Nginx, 你的现有反代)
                    ├── site A (你的其他网站)
                    ├── site B ...
                    └── china.francego.fr ──反向代理──► 127.0.0.1:3200 (Next.js, PM2)
                                                          │
                                                          └─► 127.0.0.1:5544  Postgres+pgvector (Docker)
DeepSeek API ◄── 出站 HTTPS ──┘（AI 问答时）
```

- **Web**：Next.js 用 `next start` 常驻（PM2），监听 `127.0.0.1:3200`（端口可改，避开其他站点）。
- **DB**：pgvector 容器只绑 `127.0.0.1:5544`，公网不可达。
- **CloudPanel** 负责该域名的 Nginx 反代 + Let's Encrypt SSL。

---

## 推荐路径：一键脚本 `deploy.sh`

做完 **第 1–6 步**（域名、CloudPanel 站点、Docker、拉代码、`.env.local`）后，
其余（起库 → migrate → 种子 → 摄取 → 构建 standalone → 建向量索引 → PM2 启动 → 冒烟测试）
可用仓库根目录的 `deploy.sh` 一键完成：

```bash
./deploy.sh --first      # 首次部署（含种子 + 摄取真实数据）
./deploy.sh              # 日常更新（不重置数据；migrate + 构建 + 重建向量 + 重启）
./deploy.sh --refresh    # 更新并顺带重新摄取数据（db:ingest）
```

可用环境变量覆盖：`PORT`（默认 3200）、`BIND_HOST`（默认 127.0.0.1）、
`APP_NAME`（默认 china-mos）、`MODEL_CACHE_DIR`（默认 `<root>/.model-cache`，持久化 embedding 模型）。

脚本用 **standalone 产物**（`output: 'standalone'`）：构建后自动把 `.next/static` 与 `public`
拷到 `.next/standalone`，用 PM2 跑 `node .next/standalone/server.js`。
下面第 7–8 步是它内部做的事的**手动等价版**（想手动或排错时看）。

---

## 1. 前置条件

- OVH VPS（Debian/Ubuntu，已装 CloudPanel），**建议 ≥ 2 GB 内存**
  （Next.js + 本地 embedding 模型常驻约需数百 MB；与其他站点共存请留足余量）。
- 一个二级域名指向本平台，如 `china.francego.fr`。
- 能 SSH 登录 VPS（root 或 sudo）。
- 一个 DeepSeek API Key（AI 问答需要；无 key 也能部署，界面可浏览）。

---

## 2. DNS

在你的 DNS（OVH 或域名解析商）为子域加 A 记录指向 VPS IP：

```
china.francego.fr.   A   <你的VPS_IP>
```

等待解析生效（可 `ping china.francego.fr` 验证）。

---

## 3. 在 CloudPanel 新建站点（Node.js 站点）

CloudPanel 管理台（`https://<VPS_IP>:8443`）：

1. **Sites → Add Site → Create a Node.js Site**。
2. 填写：
   - **Domain Name**：`china.francego.fr`
   - **Node.js Version**：**20** 或 **22**（Next 16 需 Node ≥ 18.18）
   - **App Port**：`3200`（若 3200 已被其他 Node 站点占用，改成空闲端口如 `3201`，后续所有步骤保持一致）
   - **Site User**：记下自动生成的用户名（下称 `<siteuser>`）
3. 创建后，站点根目录为：`/home/<siteuser>/htdocs/china.francego.fr`
   CloudPanel 已自动生成把该域名反代到 `127.0.0.1:<App Port>` 的 Nginx 配置。

> 也可用 **Reverse Proxy** 站点类型（只做反代），但 Node.js 站点会顺带装好 Node、建好隔离用户，更省事。

---

## 4. 安装 Docker（用于 Postgres + pgvector）

CloudPanel 自带的是 MySQL，本项目用 Postgres+pgvector，最简单是用 Docker 跑（与仓库一致）。
以 **root** 执行：

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# 允许站点用户免 sudo 使用 docker（部署脚本需要）
usermod -aG docker <siteuser>
```

> 让 `<siteuser>` 加入 docker 组后，**重新登录**该用户使其生效。
> 若你不希望站点用户能用 docker，可全部 DB 相关命令用 root 执行，效果相同。

---

## 5. 拉取代码

以 `<siteuser>` 登录（`su - <siteuser>` 或 SSH）：

```bash
cd /home/<siteuser>/htdocs/china.francego.fr
# 若目录非空（CloudPanel 放了占位文件），先清理占位的 index 文件
git clone <你的仓库地址> .
# 或用 rsync/scp 上传本地项目（不要传 node_modules / .next / .env.local）
```

---

## 6. 配置环境变量

```bash
cp .env.local.example .env.local
nano .env.local
```

设置（生产）：

```dotenv
DEEPSEEK_API_KEY=sk-你的key
DATABASE_URL=postgres://chinamos:chinamos@localhost:5544/chinamos
```

> 生产建议把 Postgres 密码改强（改 `docker-compose.yml` 的 `POSTGRES_PASSWORD` 与此处一致）。

---

## 7. 起数据库 + 建表 + 灌数据 + 建向量索引

仓库的 `docker-compose.yml` 会：拉 `pgvector/pgvector:pg16`、只绑 `127.0.0.1:5544`、
用 `docker/init.sql` 自动 `CREATE EXTENSION vector`。

一键完成（起库 + push schema + 种子 + 摄取真实数据 + 向量索引）：

```bash
npm ci
npm run db:setup
```

`db:setup` 等价于：
```bash
docker compose up -d          # 起 Postgres+pgvector（仅本机）
npx drizzle-kit migrate       # 建表（用迁移文件，不会像 push 那样卡在 "Pulling schema"）
tsx src/db/seed.ts            # 种子
tsx src/db/ingest.ts          # 摄取 14 个真实数据源（2–4 分钟）
tsx src/db/embed.ts           # 本地嵌入 + 建 rag_docs 向量索引（首次下载 ~110MB 模型）
```

> 若 `<siteuser>` 未加入 docker 组：先用 root 跑 `docker compose up -d`，
> 再用站点用户跑其余步骤（`drizzle-kit migrate` / `seed` / `ingest` / `embed`）。

校验：
```bash
docker exec china-mos-db psql -U chinamos -d chinamos -c "select count(*) from rag_docs;"  # 应为 60
```

---

## 8. 构建（standalone）并用 PM2 常驻

项目已开启 `output: 'standalone'`（自包含产物，体积小）。构建后需把静态资源拷进产物：

```bash
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public   # 若有 public

npm i -g pm2   # 用站点用户或 root 全局装

# 端口需与 CloudPanel 反代一致（默认 3200）；MODEL_CACHE_DIR 持久化 embedding 模型
PORT=3200 HOSTNAME=127.0.0.1 MODEL_CACHE_DIR="$PWD/.model-cache" \
  pm2 start .next/standalone/server.js --name china-mos
pm2 save
pm2 startup   # 按提示复制它输出的命令（用 root 执行）实现开机自启
```

- standalone 的 `server.js` 监听 `HOSTNAME:PORT`。
- **注意**：standalone 不会自动读 `.env.local`，务必用上面方式把环境变量（含 `DATABASE_URL`、
  `DEEPSEEK_API_KEY`、`MODEL_CACHE_DIR`）注入 PM2 进程（`deploy.sh` 已用 `source .env.local` 处理）。
- 查看：`pm2 status` / `pm2 logs china-mos`。

此时 CloudPanel 的反代已把 `china.francego.fr` → `127.0.0.1:3200`，应能访问。

---

## 9. 让 Nginx 支持 AI 流式（重要）

AI 问答用 **SSE 流式**返回。CloudPanel 的 Node.js 站点默认反代通常可用，但为保证
流式即时输出与长响应，在该站点的 **Vhost** 里为反代 location 增加：

CloudPanel → 该站点 → **Vhost**（编辑器），在反代 `location`（`proxy_pass http://127.0.0.1:3200;`）中确保包含：

```nginx
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;          # 关键：关闭缓冲，AI 才能逐字流式
    proxy_read_timeout 300s;      # AI/报告较长，放宽超时
```

保存后 CloudPanel 会自动 reload Nginx。

---

## 10. 启用 HTTPS（Let's Encrypt）

CloudPanel → 该站点 → **SSL/TLS → Actions → New Let's Encrypt Certificate** → Create。
证书自动签发并自动续期，HTTP 会自动跳 HTTPS。

---

## 11. 防火墙（保持最小开放）

CloudPanel → **Admin Area → Security（Firewall）**：

- 对外只需 **80 / 443**（网站）+ **22**（SSH）+ **8443**（CloudPanel 面板）。
- **不要**对外开放 `5544`（Postgres）与 `3200`（应用）——它们只在本机被 Nginx 反代访问。
- 现有其他站点的规则保持不变。

---

## 12. 定时刷新数据（cron）

以 `<siteuser>` 的 crontab（`crontab -e`）：

```cron
# 每天 03:30 刷新真实数据 + 重建向量索引
30 3 * * * cd /home/<siteuser>/htdocs/china.francego.fr && npm run db:ingest >> logs/ingest.log 2>&1 && npm run db:embed >> logs/embed.log 2>&1
```

先 `mkdir -p /home/<siteuser>/htdocs/china.francego.fr/logs`。

---

## 13. 备份（cron）

```cron
# 每天 04:30 备份数据库，保留 14 天
30 4 * * * docker exec china-mos-db pg_dump -U chinamos -d chinamos --format=custom > /home/<siteuser>/backups/chinamos-$(date +\%F).dump && find /home/<siteuser>/backups -name '*.dump' -mtime +14 -delete
```

先 `mkdir -p /home/<siteuser>/backups`。恢复与验证见 [OPERATIONS.md](./OPERATIONS.md) 第 6 节。

---

## 14. 更新发布（日常）

**推荐**：`git pull` 后跑一键脚本：

```bash
cd /home/<siteuser>/htdocs/china.francego.fr
git pull
./deploy.sh            # 更新（migrate + 构建 standalone + 重建向量 + 重启）
# 需同时刷新真实数据时：./deploy.sh --refresh
```

手动等价：

```bash
git pull && npm ci && npm run build
mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public
npx drizzle-kit migrate          # 如改了 schema
# 如改了数据/摄取：npm run db:ingest
npm run db:embed                 # 重建向量索引
pm2 restart china-mos --update-env
```

冒烟测试：打开首页、任一企业页；`curl 'http://127.0.0.1:3200/api/retrieve?q=新能源汽车'` 应返回 `mode:"vector"`。

---

## 15. 与其他站点共存 · 注意事项

- **隔离**：本站点有独立 CloudPanel 站点用户与 vhost，不影响其他站点。
- **端口唯一**：若 VPS 上已有别的 Node 应用占用 3200，务必在第 3、8 步改成空闲端口并保持一致。
- **Postgres 端口**：本项目用 `5544`（非默认 5432），避免与你可能已有的 Postgres 冲突；只绑本机。
- **内存**：Next.js + 本地 embedding 模型常驻约数百 MB。VPS 内存紧张时，关注 `pm2 monit` / `free -h`；
  可考虑加 swap，或把数据库迁到托管 Postgres（改 `DATABASE_URL` 即可，见下）。
- **CPU**：嵌入仅在 `db:embed`（每日一次）和 AI 请求首次冷启动时吃 CPU，平时很轻。

---

## 16. 可选：不用 Docker（托管/原生 Postgres）

若你更想用**托管 Postgres**（如 Neon/Supabase，含 pgvector）或系统原生安装：

- **托管**：在服务商建库并启用 `vector` 扩展，把 `DATABASE_URL` 换成其连接串，跳过第 4、7 步的 docker，
  直接 `npx drizzle-kit migrate && tsx src/db/seed.ts && npm run db:ingest && npm run db:embed`。
- **原生**（Debian/Ubuntu）：`apt install postgresql-16 postgresql-16-pgvector`，
  建库建用户，`CREATE EXTENSION vector;`，`DATABASE_URL` 指向本机 5432。

---

## 17. 故障速查（部署相关）

| 现象 | 排查 |
|------|------|
| 域名打不开 | DNS 是否生效；CloudPanel 站点是否创建；`pm2 status` 是否 online；端口是否与 vhost 一致 |
| 502 Bad Gateway | 应用没起或端口不匹配：`pm2 logs china-mos`；确认 `PORT` == vhost 反代端口 |
| AI 不流式/卡住 | vhost 缺 `proxy_buffering off;`（见第 9 步）；检查 `DEEPSEEK_API_KEY` |
| `/api/retrieve` 空或 lexical | `rag_docs` 未建：`npm run db:embed`；确认扩展已 `CREATE EXTENSION vector` |
| `db:setup` docker 报权限 | `<siteuser>` 未在 docker 组，或未重新登录；或改用 root 跑 docker 部分 |
| 构建 OOM | 内存不足：加 swap，或 `NODE_OPTIONS=--max-old-space-size=1536 npm run build` |
| 开机后应用没起 | 未执行 `pm2 startup` 输出的命令 / 未 `pm2 save` |

---

## 18. 部署检查清单

- [ ] DNS A 记录 → VPS IP
- [ ] CloudPanel Node.js 站点已建（域名 + Node 20/22 + 端口）
- [ ] Docker 已装，`<siteuser>` 加入 docker 组并重登
- [ ] 代码已拉到 `htdocs/<domain>`
- [ ] `.env.local` 配好 `DATABASE_URL` + `DEEPSEEK_API_KEY`
- [ ] `./deploy.sh --first`（或手动：db:setup + 构建 standalone + 组装静态资源；rag_docs=60）
- [ ] `npm run build` 通过（生成 `.next/standalone`）
- [ ] PM2 跑 `server.js` + `pm2 save` + `pm2 startup`
- [ ] vhost 加 `proxy_buffering off;` 等流式头
- [ ] Let's Encrypt 证书已签发
- [ ] 防火墙只开 80/443/22/8443
- [ ] cron：每日 ingest+embed、每日备份
- [ ] 冒烟测试通过（首页 / 企业页 / /api/retrieve）
