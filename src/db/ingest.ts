import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { getWikipediaSummary } from "../lib/sources/wikipedia";
import { getWikidataFacts } from "../lib/sources/wikidata";
import { getGoogleNews, relativeFromRfc822 } from "../lib/sources/googlenews";
import { getChinaBusinessNews, relativeTime } from "../lib/sources/gdelt";
import { getResearchTrend } from "../lib/sources/openalex";
import { getChinaExport, getChinaExportSeries, formatUSD } from "../lib/sources/comtrade";
import { getIndustrialSites, type Bbox } from "../lib/sources/overpass";
import { getPatents } from "../lib/sources/googlepatents";
import { getIndicator, getIndicatorSeries, fmtPercent, fmtUSD, fmtCount } from "../lib/sources/worldbank";
import { getFinancials, getPriceHistory } from "../lib/sources/yahoo";
import { getFxSeries } from "../lib/sources/frankfurter";
import { getProvinceGDP, getTradeFairs, getOwnership } from "../lib/sources/wikidata-sparql";
import { getTenders } from "../lib/sources/wbprocurement";

type Source = { name: string; url: string };

// Wikipedia article titles per language for each seeded company.
// Missing/incorrect titles simply fall back to the seeded text.
const wikiMap: Record<string, { zh?: string; en?: string; fr?: string }> = {
  byd: { zh: "比亚迪", en: "BYD_Company", fr: "BYD_Auto" },
  huawei: { zh: "华为", en: "Huawei", fr: "Huawei" },
  catl: { zh: "宁德时代", en: "Contemporary_Amperex_Technology", fr: "Contemporary_Amperex_Technology" },
  dji: { zh: "大疆创新", en: "DJI", fr: "DJI" },
  mindray: { zh: "迈瑞医疗", en: "Mindray", fr: "Mindray" },
  unitree: { zh: "宇树科技", en: "Unitree_Robotics", fr: "Unitree_Robotics" },
};

// Industry → OpenAlex topic query + representative HS commodity for Comtrade.
const industryMap: Record<string, { openAlex: string; hs?: string; hsLabel?: string }> = {
  nev: { openAlex: "electric vehicle", hs: "87", hsLabel: "车辆 Vehicles (HS 87)" },
  robotics: { openAlex: "humanoid robot", hs: "8479", hsLabel: "专用机械 Machines (HS 8479)" },
  medical: { openAlex: "medical device", hs: "9018", hsLabel: "医疗仪器 Medical instr. (HS 9018)" },
  battery: { openAlex: "lithium ion battery", hs: "8507", hsLabel: "蓄电池 Batteries (HS 8507)" },
  semiconductor: { openAlex: "integrated circuit", hs: "8542", hsLabel: "集成电路 ICs (HS 8542)" },
  crossborder: { openAlex: "cross-border e-commerce" },
};

// City → OpenStreetMap bounding box [south, west, north, east] for Overpass.
const cityMap: Record<string, Bbox> = {
  shenzhen: [22.52, 113.75, 22.90, 114.35], // north of the HK border (~22.52)
  shanghai: [31.05, 121.20, 31.40, 121.80],
  hangzhou: [30.15, 120.00, 30.40, 120.35],
  suzhou: [31.15, 120.40, 31.45, 120.95],
};

const COMTRADE_YEAR = 2023;
// Company → Google Patents assignee string.
const patentAssignee: Record<string, string> = {
  byd: "BYD", huawei: "Huawei", catl: "Contemporary Amperex",
  dji: "SZ DJI", mindray: "Mindray", unitree: "Unitree",
};

// Company → stock ticker (listed companies only) for Yahoo Finance.
const stockSymbol: Record<string, string> = {
  byd: "002594.SZ", catl: "300750.SZ", mindray: "300760.SZ",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function dedupeSources(list: Source[]): Source[] {
  const seen = new Set<string>();
  return list.filter((s) => s.url && !seen.has(s.url) && seen.add(s.url));
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("→ Enriching companies from Wikipedia + Wikidata…");
  const rows = await db.select().from(schema.companies);

  for (const c of rows) {
    const titles = wikiMap[c.slug];
    if (!titles) continue;

    const [zh, en, fr] = await Promise.all([
      titles.zh ? getWikipediaSummary("zh", titles.zh) : null,
      titles.en ? getWikipediaSummary("en", titles.en) : null,
      titles.fr ? getWikipediaSummary("fr", titles.fr) : null,
    ]);

    const overview = {
      zh: zh?.extract ?? c.overview.zh,
      en: en?.extract ?? c.overview.en,
      fr: fr?.extract ?? c.overview.fr,
    };

    const qid = en?.wikibaseItem ?? zh?.wikibaseItem;
    let founded = c.founded;
    let employees = c.employees;
    const extraSources: Source[] = [];

    if (qid) {
      const facts = await getWikidataFacts(qid);
      if (facts?.inceptionYear) founded = facts.inceptionYear;
      if (facts?.employees) employees = `${facts.employees.toLocaleString()}+`;
      if (facts?.website) extraSources.push({ name: "官网 / Official site", url: facts.website });
      extraSources.push({ name: `Wikidata ${qid}`, url: `https://www.wikidata.org/wiki/${qid}` });
    }
    if (zh?.contentUrl) extraSources.push({ name: "维基百科", url: zh.contentUrl });
    else if (en?.contentUrl) extraSources.push({ name: "Wikipedia", url: en.contentUrl });

    // Patents / IP from Google Patents.
    const assignee = patentAssignee[c.slug];
    const patents = assignee ? await getPatents(assignee, 5) : null;
    if (patents) extraSources.push({ name: "Google Patents", url: patents.searchUrl });

    // Financials + 5y price history from Yahoo Finance (listed companies only).
    const symbol = stockSymbol[c.slug];
    const financials = symbol ? await getFinancials(symbol) : null;
    const priceHistory = symbol ? await getPriceHistory(symbol) : null;
    if (financials) extraSources.push({ name: `Yahoo Finance (${symbol})`, url: `https://finance.yahoo.com/quote/${symbol}` });

    // Ownership (founders / parents / subsidiaries) from Wikidata.
    const ownership = qid ? await getOwnership(qid) : null;

    const sources = dedupeSources([...extraSources, ...c.sources]);

    await db.update(schema.companies)
      .set({
        overview, founded, employees, sources,
        patents: patents ?? c.patents, financials: financials ?? c.financials,
        priceHistory: priceHistory ?? c.priceHistory, ownership: ownership ?? c.ownership,
      })
      .where(eq(schema.companies.slug, c.slug));

    const hit = [zh && "zh", en && "en", fr && "fr"].filter(Boolean).join("/") || "none";
    const pat = patents ? ` · patents ${patents.total.toLocaleString()}` : "";
    const fin = financials?.marketCap ? ` · mktcap ${(financials.marketCap / 1e9).toFixed(0)}B` : "";
    const px = priceHistory ? ` · ${priceHistory.length}mo px` : "";
    const own = ownership ? ` · own(${ownership.founders.length}创/${ownership.subsidiaries.length}子)` : "";
    console.log(`  ✓ ${c.slug.padEnd(9)} live overview: ${hit}${qid ? ` · ${qid} (founded ${founded})` : ""}${pat}${fin}${px}${own}`);
    await sleep(500); // be polite to Wikipedia / Google Patents
  }

  console.log("→ Enriching industries from OpenAlex + UN Comtrade…");
  const inds = await db.select().from(schema.industries);
  for (const ind of inds) {
    const cfg = industryMap[ind.slug];
    if (!cfg) continue;

    const research = await getResearchTrend(cfg.openAlex, 6);
    const trade = cfg.hs ? await getChinaExport(cfg.hs, COMTRADE_YEAR) : null;
    let tradeStored = trade && cfg.hsLabel ? { ...trade, hs: cfg.hsLabel } : trade;
    // The keyless preview endpoint intermittently omits partner rows — keep the
    // best partner list seen across runs rather than regressing to empty.
    if (tradeStored && !tradeStored.topPartners?.length && ind.trade?.topPartners?.length) {
      tradeStored = { ...tradeStored, topPartners: ind.trade.topPartners };
    }
    // Multi-year export history for the trend chart (keep best across runs).
    if (tradeStored && cfg.hs) {
      const history = await getChinaExportSeries(cfg.hs, [2019, 2020, 2021, 2022, 2023]);
      const best = history.length >= (ind.trade?.history?.length ?? 0) ? history : ind.trade?.history;
      if (best?.length) tradeStored = { ...tradeStored, history: best };
    }

    await db.update(schema.industries)
      .set({ research: research ?? ind.research, trade: tradeStored ?? ind.trade })
      .where(eq(schema.industries.slug, ind.slug));

    const r = research ? `${research.total} papers` : "—";
    const t = trade ? `${formatUSD(trade.exportUSD)} exp, ${trade.topPartners.length} partners` : "—";
    console.log(`  ✓ ${ind.slug.padEnd(13)} OpenAlex: ${r} · Comtrade: ${t}`);
    await sleep(600); // be polite to Comtrade
  }

  console.log("→ Enriching cities from OpenStreetMap (Overpass)…");
  const cityRows = await db.select().from(schema.cities);
  for (const city of cityRows) {
    const bbox = cityMap[city.slug];
    if (!bbox) continue;
    const sites = await getIndustrialSites(bbox, 8);
    if (sites.length) {
      const geo = { lat: (bbox[0] + bbox[2]) / 2, lon: (bbox[1] + bbox[3]) / 2 };
      await db.update(schema.cities)
        .set({ geo, pois: sites.map((s) => ({ name: s.name, lat: s.lat, lon: s.lon })) })
        .where(eq(schema.cities.slug, city.slug));
    }
    console.log(`  ✓ ${city.slug.padEnd(9)} OSM industrial sites: ${sites.length}`);
    await sleep(1200); // Overpass fair-use
  }

  console.log("→ Fetching real macro indicators from World Bank…");
  const wbIndicators: { code: string; type: "pct" | "usd" | "count"; label: { zh: string; en: string; fr: string } }[] = [
    { code: "NY.GDP.MKTP.KD.ZG", type: "pct", label: { zh: "GDP 增速", en: "GDP Growth", fr: "Croissance PIB" } },
    { code: "FP.CPI.TOTL.ZG", type: "pct", label: { zh: "CPI 通胀", en: "CPI Inflation", fr: "Inflation IPC" } },
    { code: "NY.GDP.MKTP.CD", type: "usd", label: { zh: "GDP 总量", en: "GDP (US$)", fr: "PIB (US$)" } },
    { code: "BX.KLT.DINV.CD.WD", type: "usd", label: { zh: "FDI 净流入", en: "FDI Inflows", fr: "IDE entrants" } },
    { code: "NE.EXP.GNFS.CD", type: "usd", label: { zh: "出口总额", en: "Exports", fr: "Exportations" } },
    { code: "SP.POP.TOTL", type: "count", label: { zh: "人口", en: "Population", fr: "Population" } },
  ];
  const fmt = { pct: fmtPercent, usd: fmtUSD, count: fmtCount };
  const indicatorRows: { label: { zh: string; en: string; fr: string }; value: string; trend: string; up: boolean; series: { year: string; value: number }[] | null }[] = [];
  for (const ind of wbIndicators) {
    const s = await getIndicator(ind.code);
    if (!s) continue;
    const series = await getIndicatorSeries(ind.code, 12);
    const value = fmt[ind.type](s.latest.value);
    let trend = s.latest.year;
    let up = true;
    if (s.prev) {
      if (ind.type === "pct") {
        const d = s.latest.value - s.prev.value;
        trend = `${d >= 0 ? "+" : ""}${d.toFixed(1)}pp`;
        up = d >= 0;
      } else {
        const d = ((s.latest.value - s.prev.value) / Math.abs(s.prev.value)) * 100;
        trend = `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
        up = d >= 0;
      }
    }
    indicatorRows.push({
      label: { zh: `${ind.label.zh} · ${s.latest.year}`, en: `${ind.label.en} · ${s.latest.year}`, fr: `${ind.label.fr} · ${s.latest.year}` },
      value, trend, up, series,
    });
  }
  if (indicatorRows.length >= 4) {
    await db.delete(schema.indicators);
    await db.insert(schema.indicators).values(indicatorRows);
    console.log(`  ✓ World Bank: ${indicatorRows.length} indicators.`);
  } else {
    console.log(`  ⚠ World Bank returned only ${indicatorRows.length} — keeping existing indicators.`);
  }

  console.log("→ Fetching provincial GDP from Wikidata (SPARQL)…");
  const provs = await getProvinceGDP(15);
  if (provs && provs.length >= 5) {
    await db.delete(schema.provinces);
    await db.insert(schema.provinces).values(provs.map((p) => ({ name: p.name, gdpCny: String(p.gdpCny), rank: p.rank })));
    console.log(`  ✓ Wikidata: ${provs.length} provinces (top: ${provs[0].name}).`);
  } else {
    console.log(`  ⚠ Wikidata provinces returned ${provs?.length ?? 0} — keeping existing.`);
  }

  console.log("→ Fetching China trade fairs from Wikidata (SPARQL)…");
  const fairs = await getTradeFairs(12);
  if (fairs && fairs.length >= 3) {
    await db.delete(schema.fairs);
    await db.insert(schema.fairs).values(fairs);
    console.log(`  ✓ Wikidata: ${fairs.length} trade fairs.`);
  } else {
    console.log(`  ⚠ Wikidata fairs returned ${fairs?.length ?? 0} — keeping existing.`);
  }

  console.log("→ Fetching international tenders from World Bank…");
  const tenders = await getTenders(12);
  if (tenders && tenders.length) {
    await db.delete(schema.tenders);
    await db.insert(schema.tenders).values(tenders);
    console.log(`  ✓ World Bank: ${tenders.length} tender notices.`);
  } else {
    console.log("  ⚠ World Bank tenders returned nothing — keeping existing.");
  }

  console.log("→ Fetching FX rates from Frankfurter (ECB)…");
  const fxRows: { cur: string; cnyPer: string; changePct: string; up: boolean; spark: number[]; date: string }[] = [];
  for (const cur of ["EUR", "USD", "GBP", "JPY"]) {
    const s = await getFxSeries(cur);
    if (!s) continue;
    fxRows.push({
      cur: s.cur,
      cnyPer: s.cnyPer.toFixed(cur === "JPY" ? 4 : 3),
      changePct: `${s.changePct >= 0 ? "+" : ""}${s.changePct.toFixed(1)}%`,
      up: s.changePct >= 0,
      spark: s.spark,
      date: s.date,
    });
  }
  if (fxRows.length) {
    await db.delete(schema.fx);
    await db.insert(schema.fx).values(fxRows);
    console.log(`  ✓ Frankfurter: ${fxRows.length} FX pairs.`);
  } else {
    console.log("  ⚠ Frankfurter returned nothing — keeping existing FX.");
  }

  console.log("→ Fetching real news (Google News RSS, GDELT fallback)…");
  let newsRows: { title: { zh: string; en: string; fr: string }; source: string; time: string }[] = [];

  const gnews = await getGoogleNews("China business economy", 8);
  if (gnews.length) {
    newsRows = gnews.map((a) => ({
      title: { zh: a.title, en: a.title, fr: a.title },
      source: a.source,
      time: relativeFromRfc822(a.pubDate),
    }));
    console.log(`  ✓ Google News: ${gnews.length} articles.`);
  } else {
    const gdelt = await getChinaBusinessNews(8);
    newsRows = gdelt.map((a) => ({
      title: { zh: a.title, en: a.title, fr: a.title },
      source: a.domain,
      time: relativeTime(a.seendate),
    }));
    if (gdelt.length) console.log(`  ✓ GDELT fallback: ${gdelt.length} articles.`);
  }

  if (newsRows.length) {
    await db.delete(schema.news);
    await db.insert(schema.news).values(newsRows);
    console.log(`  ✓ Inserted ${newsRows.length} live news articles.`);
  } else {
    console.log("  ⚠ No live news available — keeping existing news.");
  }

  console.log("✓ Ingestion complete.");
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
