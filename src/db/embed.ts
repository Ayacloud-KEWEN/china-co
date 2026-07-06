import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { buildCorpus } from "../lib/rag/corpus";
import { embedPassages } from "../lib/rag/embed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("→ Building corpus from database…");
  const docs = await buildCorpus(db);
  console.log(`  ${docs.length} documents.`);

  console.log("→ Embedding with multilingual-e5-small (first run downloads ~110MB)…");
  const t0 = Date.now();
  const vectors = await embedPassages(docs.map((d) => `${d.title}. ${d.text}`));
  console.log(`  embedded in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);

  console.log("→ Writing rag_docs…");
  await db.delete(schema.ragDocs);
  await db.insert(schema.ragDocs).values(
    docs.map((d, i) => ({ id: d.id, kind: d.kind, title: d.title, url: d.url, content: d.text, embedding: vectors[i] }))
  );

  console.log(`✓ Indexed ${docs.length} documents into rag_docs.`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
