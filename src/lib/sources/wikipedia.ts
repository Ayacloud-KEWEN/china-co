// Wikipedia REST v1 summary API — keyless. Returns a short extract per language.
// Docs: https://<lang>.wikipedia.org/api/rest_v1/

const UA = "ChinaMOS/0.1 (https://example.com; contact@example.com)";

export type WikiSummary = {
  extract: string;
  wikibaseItem?: string; // QID, e.g. Q816528
  contentUrl?: string;
};

// Lead-section extracts for many articles at once via the MediaWiki action API.
// The REST summary endpoint used above is one-article-per-request, which is far
// too slow for thousands of divisions; `prop=extracts` accepts a batch, capped
// at exlimit=20 for anonymous callers.
//
// Returns a map keyed by the *requested* title. The API silently normalises and
// follows redirects, so both mappings are replayed to get back to the caller's
// keys. Missing articles are simply absent from the map.
export async function getWikipediaExtracts(
  lang: "zh" | "en" | "fr",
  titles: string[],
  maxChars = 600,
  onWarn?: (msg: string) => void,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const BATCH = 20;
  let failures = 0;

  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH).filter(Boolean);
    if (!batch.length) continue;

    // Be polite: a few hundred back-to-back batches will otherwise get the
    // client throttled partway through, which used to look like "no data".
    if (i > 0) await new Promise((r) => setTimeout(r, 150));

    // The API caps how much extract text one response may carry and hands back
    // a `continue` token for the rest. Without following it roughly half the
    // batch is silently dropped, so keep requesting until the token is gone.
    let cont: Record<string, string> = {};
    for (let guard = 0; guard < 25; guard++) {
      const params = new URLSearchParams({
        action: "query", prop: "extracts", exintro: "1", explaintext: "1",
        exlimit: String(BATCH), redirects: "1", format: "json", formatversion: "2",
        titles: batch.join("|"), ...cont,
      });

      type Payload = {
        query?: {
          pages?: { title: string; extract?: string; missing?: boolean }[];
          normalized?: { from: string; to: string }[];
          redirects?: { from: string; to: string }[];
        };
        continue?: Record<string, string>;
      };

      // Retry on throttling / transient errors rather than dropping the batch.
      let j: Payload | null = null;
      for (let attempt = 0; attempt < 3 && !j; attempt++) {
        try {
          const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
            headers: { "User-Agent": UA, accept: "application/json" },
            signal: AbortSignal.timeout(30_000),
          });
          if (res.ok) { j = (await res.json()) as Payload; break; }
          const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * (attempt + 1);
          onWarn?.(`${lang}: HTTP ${res.status}, retrying in ${Math.round(wait / 1000)}s`);
          await new Promise((r) => setTimeout(r, wait));
        } catch (e) {
          onWarn?.(`${lang}: ${(e as Error).message}`);
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        }
      }
      if (!j) { failures += batch.length; break; }   // give up on this batch only

      // Resolved title → extract, then walk normalisations/redirects backwards.
      const back = new Map<string, string>();   // resolved → originally requested
      for (const n of j.query?.normalized ?? []) back.set(n.to, n.from);
      for (const r of j.query?.redirects ?? []) back.set(r.to, back.get(r.from) ?? r.from);

      for (const p of j.query?.pages ?? []) {
        if (p.missing || !p.extract) continue;
        const text = String(p.extract).replace(/\s+/g, " ").trim();
        if (!text) continue;
        const key = back.get(p.title) ?? p.title;
        if (!out.has(key)) out.set(key, text.length > maxChars ? `${text.slice(0, maxChars)}…` : text);
      }

      if (!j.continue) break;
      cont = j.continue;
    }
  }
  if (failures) onWarn?.(`${lang}: gave up on ${failures} titles after retries`);
  return out;
}

export async function getWikipediaSummary(lang: "zh" | "en" | "fr", title: string): Promise<WikiSummary | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    if (j.type === "disambiguation" || !j.extract) return null;
    return {
      extract: j.extract as string,
      wikibaseItem: j.wikibase_item as string | undefined,
      contentUrl: j.content_urls?.desktop?.page as string | undefined,
    };
  } catch {
    return null;
  }
}
