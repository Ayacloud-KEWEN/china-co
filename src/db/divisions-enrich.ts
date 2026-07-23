// Fills the `divisions` intel columns from free sources, keyed by the GB/T 2260
// code via Wikidata's P442:
//
//   Wikidata  → population, area, government website, postcode, dialling code,
//               coordinates, English name, and (provinces only) nominal GDP
//   Wikipedia → zh/en/fr summaries, from the lead section of the linked article
//
//   npm run db:divisions:enrich            fill only fields that are still empty
//   npm run db:divisions:enrich -- --force refresh everything from source
//
// Default is fill-blanks-only, so anything typed in /admin/divisions survives.
// Divisions with no Wikidata item are left blank rather than guessed at (~6%).
//
// Note on GDP: measured coverage is ~90% for provinces but 0% for prefectures
// and districts, so city/district GDP stays manual entry. See docs/DATA_SOURCES.
import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "./schema";
import { getDivisionStats } from "../lib/sources/wikidata-sparql";
import { getWikipediaExtracts } from "../lib/sources/wikipedia";

// 1795826 → "179.58万"; 126012510 → "1.26亿"
function fmtPop(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(2)}万`;
  return String(Math.round(n));
}

// 186.58 → "186.58 km²"; 179800 → "179,800 km²"
function fmtArea(n: number): string {
  const v = n >= 1000 ? Math.round(n).toLocaleString("en-US") : n.toFixed(2).replace(/\.?0+$/, "");
  return `${v} km²`;
}

// 13570000000000 → "¥13.57万亿"; 850000000000 → "¥8,500亿"
function fmtGdp(n: number): string {
  if (n >= 1e12) return `¥${(n / 1e12).toFixed(2)}万亿`;
  if (n >= 1e8) return `¥${Math.round(n / 1e8).toLocaleString("en-US")}亿`;
  return `¥${Math.round(n).toLocaleString("en-US")}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const force = process.argv.includes("--force");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  const rows = await db.select().from(schema.divisions);
  if (!rows.length) {
    console.log("→ `divisions` is empty — run `npm run db:divisions` first.");
    await client.end();
    return;
  }

  // Auto-filled summaries may be missing a language (an article exists in en but
  // not zh, or a fetch dropped it), so they stay eligible for top-up. A summary
  // an admin has touched (summarySource === "") is never revisited.
  const summaryGap = (r: typeof rows[number]) =>
    !r.summary || (r.summarySource === "wikipedia" && (!r.summary.zh || !r.summary.en || !r.summary.fr));

  // A row needs work if any importable field is still blank.
  const incomplete = (r: typeof rows[number]) =>
    !r.pop || !r.area || !r.nameEn || !r.website || !r.postcode || !r.geo || summaryGap(r);
  const needs = force ? rows : rows.filter(incomplete);

  if (!needs.length) {
    console.log(`✓ All ${rows.length} divisions already populated (use --force to refresh).`);
    await client.end();
    return;
  }
  console.log(`→ ${needs.length}/${rows.length} divisions need data${force ? " (forced)" : ""}.`);

  console.log("→ Querying Wikidata…");
  const stats = await getDivisionStats(
    needs.map((r) => r.code),
    (done, matched) => console.log(`  ${done}/${needs.length} → ${matched} matched`),
  );
  console.log(`→ Wikidata returned data for ${stats.size} divisions.`);

  // Fetch Wikipedia lead sections per language, batched 20 articles at a time.
  const wantsSummary = needs.filter((r) => force || summaryGap(r));
  const extracts: Record<"zh" | "en" | "fr", Map<string, string>> = { zh: new Map(), en: new Map(), fr: new Map() };
  for (const lang of ["zh", "en", "fr"] as const) {
    const titles = [...new Set(wantsSummary.map((r) => stats.get(r.code)?.wiki[lang]).filter((t): t is string => !!t))];
    if (!titles.length) continue;
    console.log(`→ Fetching ${titles.length} ${lang} Wikipedia extracts…`);
    extracts[lang] = await getWikipediaExtracts(lang, titles, 600, (m) => console.warn(`  ! ${m}`));
    const got = extracts[lang].size;
    console.log(`  got ${got}${got < titles.length * 0.8 ? `  ⚠ only ${Math.round((got / titles.length) * 100)}% — check warnings above` : ""}`);
  }

  let updated = 0;
  for (const row of needs) {
    const s = stats.get(row.code);
    if (!s) continue;

    const set: Record<string, unknown> = {};
    const put = (key: string, blank: boolean, value: string | object | null) => {
      if (value && (force || blank)) set[key] = value;
    };

    put("pop", !row.pop, s.population > 0 ? fmtPop(s.population) : null);
    put("area", !row.area, s.areaKm2 > 0 ? fmtArea(s.areaKm2) : null);
    put("nameEn", !row.nameEn, s.nameEn);
    put("website", !row.website, s.website);
    put("postcode", !row.postcode, s.postcode);
    put("dialCode", !row.dialCode, s.dialCode);
    put("geo", !row.geo, s.lat !== null && s.lon !== null ? { lat: s.lat, lon: s.lon } : null);
    // Provinces are the only level with usable GDP coverage.
    put("gdp", !row.gdp, s.gdpCny > 0 ? fmtGdp(s.gdpCny) : null);

    // Merge per language: keep whatever is already there, fill only the gaps.
    if (force || summaryGap(row)) {
      const old = force ? null : row.summary;
      const summary = {
        zh: old?.zh || extracts.zh.get(s.wiki.zh) || "",
        en: old?.en || extracts.en.get(s.wiki.en) || "",
        fr: old?.fr || extracts.fr.get(s.wiki.fr) || "",
      };
      if (summary.zh || summary.en || summary.fr) {
        set.summary = summary;
        set.summarySource = "wikipedia";
      }
    }

    if (!Object.keys(set).length) continue;
    await db.update(schema.divisions).set(set).where(eq(schema.divisions.code, row.code));
    updated++;
  }

  const [c] = await db.select({
    pop: sql<number>`count(*) filter (where pop <> '')::int`,
    site: sql<number>`count(*) filter (where website <> '')::int`,
    sum: sql<number>`count(*) filter (where summary is not null)::int`,
  }).from(schema.divisions);
  console.log(`✓ Updated ${updated} divisions of ${rows.length}: ${c?.pop ?? 0} population, ${c?.site ?? 0} website, ${c?.sum ?? 0} summary.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
