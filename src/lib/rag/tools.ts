import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { db, schema } from "@/db";

// Tools the model can call to fetch PRECISE structured facts from the database,
// complementing RAG (which gives fuzzy context). Answers like "BYD's P/E" become
// exact lookups instead of guesses.

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export function ragTools() {
  return {
    lookupCompany: tool({
      description: "查询某家中国企业的精确结构化数据：财务（市值/股价/PE/营收/利润率/ROE）、成立年份、员工数、专利数、行业、总部、竞争对手、出口市场。用于回答关于具体公司的精确问题。",
      inputSchema: z.object({ name: z.string().describe("企业名称，中文或英文，如 比亚迪 / BYD / 宁德时代 / CATL") }),
      execute: async ({ name }) => {
        const rows = await db.select().from(schema.companies);
        const q = norm(name);
        const c = rows.find((r) => norm(r.name).includes(q) || norm(r.nameEn).includes(q) || q.includes(norm(r.name)) || q.includes(norm(r.nameEn)));
        if (!c) return { found: false, hint: `未找到企业「${name}」。库内企业：${rows.map((r) => r.name).join("、")}` };
        return {
          found: true, name: c.name, nameEn: c.nameEn, industry: c.industry, city: c.city,
          founded: c.founded, employees: c.employees, patents: c.patents?.total ?? null,
          competitors: c.competitors, exportMarkets: c.exportMarkets,
          financials: c.financials ? {
            symbol: c.financials.symbol, currency: c.financials.currency,
            price: c.financials.price, marketCap: c.financials.marketCap, pe: c.financials.pe,
            pb: c.financials.pb, eps: c.financials.eps, revenue: c.financials.revenue,
            revenueGrowth: c.financials.revenueGrowth, grossMargin: c.financials.grossMargin,
            profitMargin: c.financials.profitMargin, roe: c.financials.roe,
          } : null,
          sources: c.sources.map((s) => s.name),
        };
      },
    }),

    lookupIndustry: tool({
      description: "查询某个中国行业的精确数据：市场规模、增长率、龙头企业、主要城市、对外贸易（中国出口额与主要出口市场，来自 UN Comtrade）、研究活跃度（论文数，来自 OpenAlex）。",
      inputSchema: z.object({ name: z.string().describe("行业名称，如 新能源汽车 / 动力电池 / 半导体 / 机器人") }),
      execute: async ({ name }) => {
        const rows = await db.select().from(schema.industries);
        const q = norm(name);
        const i = rows.find((r) => norm(r.name).includes(q) || norm(r.nameEn).includes(q) || q.includes(norm(r.name)));
        if (!i) return { found: false, hint: `未找到行业「${name}」。库内行业：${rows.map((r) => r.name).join("、")}` };
        return {
          found: true, name: i.name, marketSize: i.marketSize, growth: i.growth,
          leaders: i.leaders, cities: i.cities,
          trade: i.trade ? { hs: i.trade.hs, year: i.trade.year, exportUSD: i.trade.exportUSD, topPartners: i.trade.topPartners } : null,
          researchPapers: i.research?.total ?? null,
        };
      },
    }),

    getMacroIndicators: tool({
      description: "获取中国最新宏观经济指标（World Bank）：GDP 增速、CPI、GDP 总量、FDI、出口、人口，含年份与同比。",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await db.select().from(schema.indicators);
        return rows.map((r) => ({ label: r.label.zh, value: r.value, trend: r.trend }));
      },
    }),

    getFxRates: tool({
      description: "获取人民币汇率（欧洲央行/Frankfurter）：1 单位外币 = 多少人民币，含 30 日变化。",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await db.select().from(schema.fx);
        return rows.map((r) => ({ pair: `1 ${r.cur} = ¥${r.cnyPer}`, change30d: r.changePct }));
      },
    }),

    getProvinceRanking: tool({
      description: "获取中国省级 GDP 排行（Wikidata），返回前 N 名及 GDP（万亿元）。",
      inputSchema: z.object({ top: z.number().optional().describe("返回前几名，默认 10") }),
      execute: async ({ top = 10 }) => {
        const rows = await db.select().from(schema.provinces);
        return rows.sort((a, b) => a.rank - b.rank).slice(0, top).map((p) => ({ rank: p.rank, province: p.name, gdpTrillionCNY: (Number(p.gdpCny) / 1e12).toFixed(2) }));
      },
    }),
  };
}
