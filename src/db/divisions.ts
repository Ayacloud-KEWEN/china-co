// Loads the full Chinese administrative hierarchy (province → city → district)
// into `divisions`. Source: GB/T 2260 / 统计用区划代码, published as JSON by
// github.com/modood/Administrative-divisions-of-China.
//
// Idempotent: re-running refreshes names and structure but never touches the
// admin-filled intel columns (gdp/pop/pillars/summary/notes/city_slug).
//
//   npm run db:divisions
//
// To extend to township level later, point SOURCE at pca(t)-code data with a
// 4th nesting level — the flattener already handles arbitrary depth.
import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const SOURCE =
  "https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pca-code.json";

type Node = { code: string; name: string; children?: Node[] };
type Row = { code: string; parentCode: string | null; level: "province" | "city" | "district" | "town"; name: string };

const LEVELS = ["province", "city", "district", "town"] as const;

function flatten(nodes: Node[], parent: string | null, depth: number, out: Row[]) {
  for (const n of nodes) {
    out.push({ code: n.code, parentCode: parent, level: LEVELS[Math.min(depth, 3)], name: n.name });
    if (n.children?.length) flatten(n.children, n.code, depth + 1, out);
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  console.log(`→ Fetching ${SOURCE}`);
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const tree = (await res.json()) as Node[];

  const rows: Row[] = [];
  flatten(tree, null, 0, rows);
  const byLevel = rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.level]: (a[r.level] ?? 0) + 1 }), {});
  console.log(`→ Flattened ${rows.length} divisions`, byLevel);

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  // Chunked upsert — structure/name refresh only, intel columns preserved.
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(schema.divisions).values(rows.slice(i, i + CHUNK)).onConflictDoUpdate({
      target: schema.divisions.code,
      set: {
        name: sql`excluded.name`,
        parentCode: sql`excluded.parent_code`,
        level: sql`excluded.level`,
      },
    });
  }

  console.log(`✓ ${rows.length} divisions upserted.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
