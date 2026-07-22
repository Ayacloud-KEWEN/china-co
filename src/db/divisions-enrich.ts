// Fills the `divisions` intel columns from Wikidata (population P1082, area
// P2046, English label), keyed by the GB/T 2260 code via P442.
//
//   npm run db:divisions:enrich            fill only rows whose field is empty
//   npm run db:divisions:enrich -- --force refresh every row from Wikidata
//
// Default is fill-blanks-only, so anything typed in /admin/divisions survives.
// Rows with no Wikidata item are left untouched rather than guessed at — as of
// the last run that is ~6% of districts.
//
// GDP is deliberately NOT sourced here: fewer than 40 items nationwide carry
// P2131 with a division code, so there is nothing to fill from. Provincial GDP
// lives in the separate `provinces` table (see ingest.ts).
import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "./schema";
import { getDivisionStats } from "../lib/sources/wikidata-sparql";

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

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const force = process.argv.includes("--force");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  const rows = await db.select({
    code: schema.divisions.code, pop: schema.divisions.pop,
    area: schema.divisions.area, nameEn: schema.divisions.nameEn,
  }).from(schema.divisions);

  if (!rows.length) {
    console.log("→ `divisions` is empty — run `npm run db:divisions` first.");
    await client.end();
    return;
  }

  const needs = force ? rows : rows.filter((r) => !r.pop || !r.area || !r.nameEn);
  if (!needs.length) {
    console.log(`✓ All ${rows.length} divisions already populated — nothing to do (use --force to refresh).`);
    await client.end();
    return;
  }
  console.log(`→ ${needs.length}/${rows.length} divisions need data${force ? " (forced)" : ""}. Querying Wikidata…`);

  const stats = await getDivisionStats(
    needs.map((r) => r.code),
    (done, matched) => console.log(`  ${done}/${needs.length} → ${matched} matched`),
  );
  console.log(`→ Wikidata returned data for ${stats.size} divisions.`);

  let updated = 0;
  for (const row of needs) {
    const s = stats.get(row.code);
    if (!s) continue;

    // Only write fields we actually got, and (unless --force) only over blanks.
    const set: Partial<{ pop: string; area: string; nameEn: string }> = {};
    if (s.population > 0 && (force || !row.pop)) set.pop = fmtPop(s.population);
    if (s.areaKm2 > 0 && (force || !row.area)) set.area = fmtArea(s.areaKm2);
    if (s.nameEn && (force || !row.nameEn)) set.nameEn = s.nameEn;
    if (!Object.keys(set).length) continue;

    await db.update(schema.divisions).set(set).where(eq(schema.divisions.code, row.code));
    updated++;
  }

  const [filled] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.divisions).where(sql`pop <> ''`);
  console.log(`✓ Updated ${updated} divisions. ${filled?.n ?? 0}/${rows.length} now have a population figure.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
