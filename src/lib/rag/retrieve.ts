import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { buildCorpus, terms, lexScore } from "./corpus";
import { embedQuery, toVectorLiteral } from "./embed";

// RAG retriever. Primary path: pgvector cosine similarity over rag_docs
// (semantic, multilingual). Fallback: lexical scoring over the live corpus if
// embeddings/rag_docs are unavailable.

export type RagSource = { n: number; kind: string; title: string; url: string; score: number };
export type RagResult = { context: string; sources: RagSource[]; mode: "vector" | "lexical" | "none" };

const MIN_SIM = 0.80; // e5 cosine similarity threshold

async function vectorSearch(query: string, topK: number): Promise<RagResult | null> {
  try {
    const qv = toVectorLiteral(await embedQuery(query));
    const rows = await db.execute(sql`
      SELECT kind, title, url, content, 1 - (embedding <=> ${qv}::vector) AS score
      FROM rag_docs
      ORDER BY embedding <=> ${qv}::vector
      LIMIT ${topK}
    `);
    const list = (rows as unknown as { kind: string; title: string; url: string; content: string; score: number }[])
      .filter((r) => Number(r.score) >= MIN_SIM);
    if (!list.length) return { context: "", sources: [], mode: "vector" };
    const sources: RagSource[] = list.map((r, i) => ({ n: i + 1, kind: r.kind, title: r.title, url: r.url, score: Number(r.score) }));
    const context = list.map((r, i) => `[${i + 1}] (${r.kind}) ${r.title}\n${r.content.slice(0, 600)}`).join("\n\n");
    return { context, sources, mode: "vector" };
  } catch {
    return null; // rag_docs missing or model failed → fall back
  }
}

async function lexicalSearch(query: string, topK: number): Promise<RagResult> {
  const ts = terms(query);
  if (!ts.length) return { context: "", sources: [], mode: "none" };
  const corpus = await buildCorpus(db);
  const ranked = corpus
    .map((d) => ({ d, s: lexScore(d, ts) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  if (!ranked.length) return { context: "", sources: [], mode: "none" };
  const sources: RagSource[] = ranked.map((x, i) => ({ n: i + 1, kind: x.d.kind, title: x.d.title, url: x.d.url, score: x.s }));
  const context = ranked.map((x, i) => `[${i + 1}] (${x.d.kind}) ${x.d.title}\n${x.d.text.slice(0, 600)}`).join("\n\n");
  return { context, sources, mode: "lexical" };
}

export async function retrieve(query: string, topK = 6): Promise<RagResult> {
  if (!query.trim()) return { context: "", sources: [], mode: "none" };
  const v = await vectorSearch(query, topK);
  if (v && v.sources.length) return v;
  return lexicalSearch(query, topK);
}
