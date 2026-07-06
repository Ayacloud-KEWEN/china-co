// Shared corpus builder + lexical scorer for RAG. No server-only import here so
// it can run both inside Next (retriever) and from the tsx embed script.
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

export type Doc = { id: string; kind: string; title: string; url: string; text: string; name: string };

type DB = PostgresJsDatabase<typeof schema>;

export async function buildCorpus(db: DB): Promise<Doc[]> {
  const [companies, industries, cities, suppliers, policies, playbooks, provinces, fairs, news] =
    await Promise.all([
      db.select().from(schema.companies),
      db.select().from(schema.industries),
      db.select().from(schema.cities),
      db.select().from(schema.suppliers),
      db.select().from(schema.policies),
      db.select().from(schema.playbooks),
      db.select().from(schema.provinces),
      db.select().from(schema.fairs),
      db.select().from(schema.news),
    ]);

  const docs: Doc[] = [];
  const push = (kind: string, title: string, url: string, name: string, text: string) =>
    docs.push({ id: `${kind}::${title}`, kind, title, url, name, text: text.replace(/\s+/g, " ").trim() });

  for (const c of companies) {
    const fin = c.financials ? `财务：市值/营收/PE 来自 Yahoo Finance（${c.financials.symbol}）。` : "";
    const pat = c.patents ? `专利约 ${c.patents.total} 项（Google Patents）。` : "";
    push("企业", `${c.name} (${c.nameEn})`, `/companies/${c.slug}`, `${c.name} ${c.nameEn}`,
      `${c.name} ${c.nameEn} 行业${c.industry} 总部${c.city} 成立${c.founded} 员工${c.employees} 营收${c.revenue} ${c.tags.join(" ")} ${c.overview.zh} ${c.overview.en} 产品:${c.products.join("、")} 竞争对手:${c.competitors.join("、")} 出口:${c.exportMarkets.join("、")} ${fin} ${pat}`);
  }
  for (const i of industries) {
    const tr = i.trade ? `出口额约 ${(i.trade.exportUSD / 1e9).toFixed(0)}B 美元（${i.trade.hs}），主要出口市场 ${i.trade.topPartners.map((p) => p.name).join("、")}。` : "";
    const rs = i.research ? `研究活跃度：${i.research.total} 篇论文（OpenAlex）。` : "";
    push("行业", `${i.name} (${i.nameEn})`, `/industries/${i.slug}`, `${i.name} ${i.nameEn}`,
      `${i.name} ${i.nameEn} 市场规模${i.marketSize} 增速${i.growth}% 龙头:${i.leaders.join("、")} 主要城市:${i.cities.join("、")} ${i.summary.zh} ${i.summary.en} ${tr} ${rs}`);
  }
  for (const c of cities) {
    const pois = c.pois?.length ? `工业区/园区：${c.pois.slice(0, 6).map((p) => p.name).join("、")}（OpenStreetMap）。` : "";
    push("城市", c.name, `/cities/${c.slug}`, `${c.name} ${c.nameEn}`,
      `${c.name} ${c.nameEn} GDP${c.gdp} 人口${c.pop} 支柱产业:${c.pillars.join("、")} 代表企业:${c.leaders.join("、")} ${c.summary.zh} ${c.summary.en} ${pois}`);
  }
  for (const s of suppliers)
    push("供应商", s.name, `/supply-chain`, s.name,
      `${s.name} 类别${s.category} 位置${s.city} 产品:${s.products.join("、")} 产能${s.capacity} 认证:${s.certs.join("、")} 风险评分${s.riskScore} 出口:${s.exportMarkets.join("、")}`);
  for (const p of policies)
    push("政策", p.title.zh, `/policy`, p.title.zh,
      `${p.title.zh} ${p.title.en} 发布机构${p.org} 日期${p.date} 影响${p.impact} 标签:${p.tags.join("、")}`);
  for (const p of playbooks)
    push("攻略", p.title.zh, `/playbooks/${p.slug}`, p.title.zh,
      `${p.title.zh} ${p.title.en} 分类${p.category} 预计时间${p.time} 预计成本${p.cost} 难度${p.difficulty}`);
  for (const p of provinces)
    push("省份GDP", `${p.name}（第${p.rank}）`, `/cities`, p.name,
      `${p.name} 省级GDP ¥${(Number(p.gdpCny) / 1e12).toFixed(2)}万亿 全国排名第${p.rank}（Wikidata）`);
  for (const f of fairs)
    push("展会", f.name, `/opportunities`, f.name, `${f.name} 展会 地点${f.city} 官网${f.website}`);
  for (const n of news)
    push("新闻", n.title.zh, `/`, n.title.zh, `${n.title.zh} ${n.title.en} 来源${n.source} ${n.time}`);

  return docs;
}

// --- Lexical scoring (fallback when embeddings are unavailable) ---

export function terms(query: string): string[] {
  const q = query.toLowerCase();
  const out = new Set<string>();
  for (const tok of q.split(/[^\p{L}\p{N}]+/u)) {
    if (tok.length >= 2 && !/^[一-鿿]+$/.test(tok)) out.add(tok);
  }
  for (const run of q.match(/[一-鿿]+/g) ?? []) {
    if (run.length === 1) out.add(run);
    for (let i = 0; i < run.length - 1; i++) out.add(run.slice(i, i + 2));
  }
  return [...out];
}

export function lexScore(doc: Doc, ts: string[]): number {
  const name = doc.name.toLowerCase();
  const text = doc.text.toLowerCase();
  let s = 0;
  for (const t of ts) {
    if (name.includes(t)) s += 3;
    if (text.includes(t)) s += 1;
  }
  return s;
}
