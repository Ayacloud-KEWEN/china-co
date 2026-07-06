// World Bank Open Data API — keyless. Real macro indicators for China (CHN).
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

export type WBPoint = { year: string; value: number };
export type WBSeries = { latest: WBPoint; prev?: WBPoint };

export async function getIndicator(code: string): Promise<WBSeries | null> {
  const url = `https://api.worldbank.org/v2/country/CHN/indicator/${code}?format=json&mrv=2`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const rows: { date: string; value: number | null }[] = Array.isArray(j) ? j[1] ?? [] : [];
    const points = rows
      .filter((r) => r.value != null)
      .map((r) => ({ year: r.date, value: r.value as number }))
      .sort((a, b) => Number(b.year) - Number(a.year));
    if (!points.length) return null;
    return { latest: points[0], prev: points[1] };
  } catch {
    return null;
  }
}

// Multi-year series (oldest → newest) for trend charts.
export async function getIndicatorSeries(code: string, n = 12): Promise<{ year: string; value: number }[] | null> {
  const url = `https://api.worldbank.org/v2/country/CHN/indicator/${code}?format=json&mrv=${n}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const rows: { date: string; value: number | null }[] = Array.isArray(j) ? j[1] ?? [] : [];
    const pts = rows.filter((r) => r.value != null).map((r) => ({ year: r.date, value: r.value as number }))
      .sort((a, b) => Number(a.year) - Number(b.year));
    return pts.length ? pts : null;
  } catch {
    return null;
  }
}

export function fmtPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function fmtUSD(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(0)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export function fmtCount(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return v.toLocaleString();
}
