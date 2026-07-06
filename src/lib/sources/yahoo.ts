// Yahoo Finance (unofficial quoteSummary) — keyless but requires a cookie+crumb
// handshake. Node's fetch cookie handling + Yahoo's datacenter checks are flaky,
// so we drive curl (present on Windows 10+/macOS/Linux) with a cookie jar.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileP = promisify(execFile);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChinaMOS/0.1";
const COOKIE_JAR = join(tmpdir(), "china-mos-yahoo-cookies.txt");

let crumb: string | null = null;

async function curl(args: string[]): Promise<string> {
  const { stdout } = await execFileP("curl", ["-s", "--max-time", "25", "-A", UA, ...args], {
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout;
}

async function ensureCrumb(): Promise<string | null> {
  if (crumb) return crumb;
  try {
    // Seed the cookie jar (the 404 response still sets the consent cookie).
    await curl(["-c", COOKIE_JAR, "https://fc.yahoo.com/"]);
    const c = (await curl(["-b", COOKIE_JAR, "-c", COOKIE_JAR, "https://query1.finance.yahoo.com/v1/test/getcrumb"])).trim();
    if (c && !c.includes("<") && c.length > 0 && c.length < 40) { crumb = c; return crumb; }
  } catch { /* fall through */ }
  return null;
}

type Num = { raw?: number } | undefined;
const n = (x: Num): number | null => (typeof x?.raw === "number" ? x.raw : null);

export type Financials = {
  symbol: string; currency: string; exchange: string; asOf: string;
  price: number | null; changePct: number | null; marketCap: number | null;
  pe: number | null; pb: number | null; eps: number | null;
  week52High: number | null; week52Low: number | null;
  revenue: number | null; revenueGrowth: number | null;
  grossMargin: number | null; profitMargin: number | null; roe: number | null;
};

export async function getFinancials(symbol: string): Promise<Financials | null> {
  const cr = await ensureCrumb();
  if (!cr) return null;
  const modules = "price,summaryDetail,financialData,defaultKeyStatistics";
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}&crumb=${encodeURIComponent(cr)}`;
  try {
    const out = await curl(["-b", COOKIE_JAR, url]);
    if (!out.trim().startsWith("{")) return null;
    const j = JSON.parse(out);
    const r = j.quoteSummary?.result?.[0];
    if (!r) return null;
    const p = r.price ?? {}, sd = r.summaryDetail ?? {}, fd = r.financialData ?? {}, ks = r.defaultKeyStatistics ?? {};
    return {
      symbol,
      currency: p.currency ?? "CNY",
      exchange: p.exchangeName ?? "",
      asOf: new Date().toISOString().slice(0, 10),
      price: n(p.regularMarketPrice),
      changePct: n(p.regularMarketChangePercent) != null ? n(p.regularMarketChangePercent)! * 100 : null,
      marketCap: n(p.marketCap),
      pe: n(sd.trailingPE),
      pb: n(ks.priceToBook),
      eps: n(ks.trailingEps),
      week52High: n(sd.fiftyTwoWeekHigh),
      week52Low: n(sd.fiftyTwoWeekLow),
      revenue: n(fd.totalRevenue),
      revenueGrowth: n(fd.revenueGrowth) != null ? n(fd.revenueGrowth)! * 100 : null,
      grossMargin: n(fd.grossMargins) != null ? n(fd.grossMargins)! * 100 : null,
      profitMargin: n(fd.profitMargins) != null ? n(fd.profitMargins)! * 100 : null,
      roe: n(fd.returnOnEquity) != null ? n(fd.returnOnEquity)! * 100 : null,
    };
  } catch {
    return null;
  }
}
