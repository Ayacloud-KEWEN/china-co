// Local multilingual embeddings via transformers.js (keyless). Model:
// Xenova/multilingual-e5-small → 384-dim, good zh/en retrieval. e5 expects
// "query: " / "passage: " prefixes. The pipeline is a process-wide singleton.
import { pipeline, env, type FeatureExtractionPipeline } from "@xenova/transformers";

export const EMBED_DIM = 384;
const MODEL = "Xenova/multilingual-e5-small";

// Persist the downloaded model in a stable dir (survives redeploys / standalone
// rebuilds) so it is fetched once. Set MODEL_CACHE_DIR in production.
if (process.env.MODEL_CACHE_DIR) env.cacheDir = process.env.MODEL_CACHE_DIR;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) extractorPromise = pipeline("feature-extraction", MODEL);
  return extractorPromise;
}

async function embed(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  const [rows, dim] = out.dims as [number, number];
  const data = out.data as Float32Array;
  const vectors: number[][] = [];
  for (let r = 0; r < rows; r++) vectors.push(Array.from(data.slice(r * dim, (r + 1) * dim)));
  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  return (await embed([`query: ${text}`]))[0];
}

export async function embedPassages(texts: string[]): Promise<number[][]> {
  return embed(texts.map((t) => `passage: ${t}`));
}

// pgvector literal, e.g. "[0.1,0.2,...]"
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
