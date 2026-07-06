// Google News RSS — keyless. Returns recent articles for a query.
// Feed items look like: <item><title>Headline - Source</title><pubDate>…</pubDate>
//   <source url="…">Source Name</source></item>

const UA = "Mozilla/5.0 (compatible; ChinaMOS/0.1)";

export type NewsArticle = { title: string; source: string; pubDate: string; link: string };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : null;
}

export async function getGoogleNews(query: string, limit = 8): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.split("<item>").slice(1).map((s) => s.split("</item>")[0]);
    return items.slice(0, limit).map((block) => {
      const rawTitle = tag(block, "title") ?? "";
      const source = tag(block, "source") ?? rawTitle.split(" - ").pop() ?? "Google News";
      // Google appends " - Source" to titles; strip it for a clean headline.
      const title = source && rawTitle.endsWith(` - ${source}`)
        ? rawTitle.slice(0, -(source.length + 3)) : rawTitle;
      return { title, source, pubDate: tag(block, "pubDate") ?? "", link: tag(block, "link") ?? "" };
    }).filter((a) => a.title);
  } catch {
    return [];
  }
}

// "Wed, 01 Jul 2026 12:30:00 GMT" → relative "3h" / "2d"
export function relativeFromRfc822(pubDate: string): string {
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const hrs = Math.floor(diff / 3.6e6);
  if (hrs < 1) return `${Math.max(1, Math.floor(diff / 6e4))}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
