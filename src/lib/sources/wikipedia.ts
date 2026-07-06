// Wikipedia REST v1 summary API — keyless. Returns a short extract per language.
// Docs: https://<lang>.wikipedia.org/api/rest_v1/

const UA = "ChinaMOS/0.1 (https://example.com; contact@example.com)";

export type WikiSummary = {
  extract: string;
  wikibaseItem?: string; // QID, e.g. Q816528
  contentUrl?: string;
};

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
