// GDELT 2.0 Doc API — keyless real-time global news. Rate limit: 1 req / 5s.
// Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

const UA = "ChinaMOS/0.1 (https://example.com; contact@example.com)";

export type GdeltArticle = { title: string; url: string; domain: string; seendate: string };

export async function getChinaBusinessNews(maxrecords = 8): Promise<GdeltArticle[]> {
  const query = '(China business OR China economy OR Chinese company) sourcelang:english';
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}` +
    `&mode=artlist&maxrecords=${maxrecords}&format=json&sort=datedesc&timespan=3d`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const text = await res.text();
    if (!text.trim().startsWith("{")) return []; // rate-limit / plain-text notice
    const j = JSON.parse(text);
    return (j.articles ?? []).map((a: Record<string, string>) => ({
      title: a.title, url: a.url, domain: a.domain, seendate: a.seendate,
    }));
  } catch {
    return [];
  }
}

// GDELT seendate: "20260701T153000Z" → relative "3h" / "2d"
export function relativeTime(seendate: string): string {
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return "";
  const [, y, mo, d, h, mi, s] = m;
  const then = Date.parse(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
  const diff = Date.now() - then;
  const hrs = Math.floor(diff / 3.6e6);
  if (hrs < 1) return `${Math.max(1, Math.floor(diff / 6e4))}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
