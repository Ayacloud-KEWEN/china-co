// Frankfurter API — keyless FX rates sourced from the European Central Bank.
// We express each currency as "1 <CUR> = N CNY" with a 30-day trend, for the
// European audience doing business in China. Docs: https://frankfurter.dev

export type FxSeries = {
  cur: string;          // e.g. "EUR"
  cnyPer: number;       // how many CNY for 1 unit of `cur`
  changePct: number;    // % change over the window
  spark: number[];      // recent CNY-per-unit values (oldest → newest)
  date: string;         // latest observation date
};

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getFxSeries(cur: string): Promise<FxSeries | null> {
  const end = new Date();
  const start = new Date(end.getTime() - 35 * 864e5);
  const url = `https://api.frankfurter.dev/v1/${ymd(start)}..${ymd(end)}?base=${cur}&symbols=CNY`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const rates: Record<string, { CNY?: number }> = j.rates ?? {};
    const points = Object.keys(rates)
      .sort()
      .map((d) => rates[d].CNY)
      .filter((v): v is number => typeof v === "number");
    if (points.length < 2) return null;
    const cnyPer = points[points.length - 1];
    const first = points[0];
    const changePct = ((cnyPer - first) / first) * 100;
    const dates = Object.keys(rates).sort();
    return {
      cur,
      cnyPer,
      changePct,
      spark: points.slice(-20),
      date: dates[dates.length - 1],
    };
  } catch {
    return null;
  }
}
