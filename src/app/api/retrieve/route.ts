import { retrieve } from "@/lib/rag/retrieve";

export const runtime = "nodejs";

// Lightweight retrieval endpoint (used for verification and optional client-side
// preview of what the RAG layer found). Returns matched sources + context.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const { context, sources, mode } = await retrieve(q, 6);
  return Response.json({ query: q, mode, sources, contextChars: context.length });
}
