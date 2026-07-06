// Google Patents (unofficial xhr JSON endpoint) — keyless. Returns a patent
// count and top results for an assignee, as a proxy for a company's IP portfolio.
//
// Note: Google blocks Node's fetch (undici) on this endpoint with HTTP 503
// (TLS fingerprinting), so we shell out to `curl` (present on Windows 10+,
// macOS and Linux) and fall back to fetch if curl is unavailable.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChinaMOS/0.1";

export type PatentHit = { number: string; title: string; url: string };
export type PatentPortfolio = { assignee: string; total: number; top: PatentHit[]; searchUrl: string };

async function fetchJson(url: string): Promise<unknown | null> {
  // Prefer curl (bypasses the undici TLS block).
  try {
    const { stdout } = await execFileP("curl", ["-s", "--max-time", "25", "-A", UA, url], {
      maxBuffer: 8 * 1024 * 1024,
    });
    if (stdout.trim().startsWith("{")) return JSON.parse(stdout);
  } catch {
    /* curl missing or failed — try fetch */
  }
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getPatents(assignee: string, topN = 5, retries = 3): Promise<PatentPortfolio | null> {
  const inner = `assignee=${encodeURIComponent(assignee)}`;
  const url = `https://patents.google.com/xhr/query?url=${encodeURIComponent(inner)}&exp=`;

  // Google intermittently serves an "unusual traffic" page; back off and retry.
  type Resp = { results?: { total_num_results?: number; user_error?: string; cluster?: { result?: { id?: string; patent?: { title?: string } }[] }[] } };
  let j: Resp | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    j = (await fetchJson(url)) as Resp | null;
    if (j?.results) break;
    if (attempt < retries - 1) await sleep(5000 * (attempt + 1)); // 5s, 10s
  }
  const r = j?.results;
  if (!r || r.user_error) return null;

  const total = r.total_num_results ?? 0;
  const results = r.cluster?.[0]?.result ?? [];
  const top: PatentHit[] = results.slice(0, topN).map((it) => {
    const number = (it.id ?? "").replace(/^patent\//, "").replace(/\/en$/, "");
    return { number, title: (it.patent?.title ?? "").trim(), url: `https://patents.google.com/patent/${number}/en` };
  }).filter((p) => p.number && p.title);

  if (!total && !top.length) return null;
  return { assignee, total, top, searchUrl: `https://patents.google.com/?assignee=${encodeURIComponent(assignee)}` };
}
