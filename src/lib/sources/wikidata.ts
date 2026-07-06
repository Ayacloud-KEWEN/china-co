// Wikidata structured facts via Special:EntityData — keyless.
// Extracts inception (P571), employees (P1128), official website (P856).

const UA = "ChinaMOS/0.1 (https://example.com; contact@example.com)";

export type WikidataFacts = {
  inceptionYear?: number;
  employees?: number;
  website?: string;
};

type Claim = {
  mainsnak?: { datavalue?: { value?: unknown } };
};

function claimValue(entity: Record<string, unknown>, prop: string): unknown {
  const claims = (entity.claims as Record<string, Claim[]> | undefined)?.[prop];
  return claims?.[0]?.mainsnak?.datavalue?.value;
}

export async function getWikidataFacts(qid: string): Promise<WikidataFacts | null> {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const entity = j.entities?.[qid];
    if (!entity) return null;

    const facts: WikidataFacts = {};

    // P571 inception → time like "+1995-02-10T00:00:00Z"
    const inception = claimValue(entity, "P571") as { time?: string } | undefined;
    if (inception?.time) {
      const y = parseInt(inception.time.replace("+", "").slice(0, 4), 10);
      if (!Number.isNaN(y)) facts.inceptionYear = y;
    }

    // P1128 employees → { amount: "+700000" }
    const emp = claimValue(entity, "P1128") as { amount?: string } | undefined;
    if (emp?.amount) {
      const n = Math.abs(parseInt(emp.amount.replace("+", ""), 10));
      if (!Number.isNaN(n)) facts.employees = n;
    }

    // P856 official website → string URL
    const site = claimValue(entity, "P856") as string | undefined;
    if (typeof site === "string") facts.website = site;

    return facts;
  } catch {
    return null;
  }
}
