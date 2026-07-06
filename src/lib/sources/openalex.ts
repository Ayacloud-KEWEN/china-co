// OpenAlex — keyless scholarly data. We use it as a proxy for research/tech
// activity in an industry: yearly publication counts for a topic query.
// Docs: https://docs.openalex.org/

const UA = "ChinaMOS/0.1 (mailto:contact@example.com)";

export type ResearchTrend = {
  query: string;
  total: number;
  series: { year: number; count: number }[];
};

export async function getResearchTrend(query: string, years = 6): Promise<ResearchTrend | null> {
  const url =
    `https://api.openalex.org/works?filter=title.search:${encodeURIComponent(query)}` +
    `&group_by=publication_year&per_page=1&mailto=contact@example.com`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const j = await res.json();
    const total = j.meta?.count ?? 0;
    const groups: { key: string; count: number }[] = j.group_by ?? [];
    const thisYear = new Date().getFullYear();
    const series = groups
      .map((g) => ({ year: parseInt(g.key, 10), count: g.count }))
      .filter((g) => !Number.isNaN(g.year) && g.year <= thisYear && g.year > thisYear - years)
      .sort((a, b) => a.year - b.year);
    if (!series.length) return null;
    return { query, total, series };
  } catch {
    return null;
  }
}
