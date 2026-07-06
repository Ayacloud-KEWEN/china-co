// UN Comtrade — keyless "preview" endpoint. We fetch China's (reporter 156)
// annual exports (flow X) for a representative HS commodity, to World and to a
// fixed set of major partners, then rank the partners.
// Docs: https://comtradeapi.un.org/

const BASE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";

// Major China trade partners (Comtrade M49 codes) for partner ranking.
const PARTNERS: Record<number, string> = {
  842: "United States", 276: "Germany", 528: "Netherlands", 392: "Japan",
  410: "Rep. of Korea", 826: "United Kingdom", 250: "France", 356: "India",
};

export type TradeFlow = {
  hs: string;
  year: number;
  exportUSD: number;
  topPartners: { name: string; valueUSD: number }[];
};

async function fetchRows(params: Record<string, string | number>): Promise<Record<string, unknown>[]> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${BASE}?${qs}`, { headers: { accept: "application/json" } });
  if (!res.ok) return [];
  const j = await res.json();
  return (j.data ?? []) as Record<string, unknown>[];
}

export async function getChinaExport(hs: string, year: number): Promise<TradeFlow | null> {
  try {
    // Total exports to the World.
    const world = await fetchRows({
      reporterCode: 156, period: year, partnerCode: 0, cmdCode: hs, flowCode: "X",
    });
    const exportUSD = Number(world[0]?.primaryValue ?? 0);
    if (!exportUSD) return null;

    // Exports to a set of key partners (comma-separated partner codes).
    const partnerRows = await fetchRows({
      reporterCode: 156, period: year, partnerCode: Object.keys(PARTNERS).join(","),
      cmdCode: hs, flowCode: "X",
    });
    const topPartners = partnerRows
      .map((r) => ({
        name: PARTNERS[Number(r.partnerCode)] ?? String(r.partnerDesc ?? r.partnerCode),
        valueUSD: Number(r.primaryValue ?? 0),
      }))
      .filter((p) => p.valueUSD > 0)
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .slice(0, 5);

    return { hs, year, exportUSD, topPartners };
  } catch {
    return null;
  }
}

export function formatUSD(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}
