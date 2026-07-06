// Wikidata Query Service (SPARQL) — keyless. Used for structured lists that the
// entity API can't easily give: provincial GDP and China trade fairs.
// Endpoint: https://query.wikidata.org/sparql

const UA = "ChinaMOS/0.1 (contact@example.com)";
const ENDPOINT = "https://query.wikidata.org/sparql";

async function sparql(query: string): Promise<Record<string, { value: string }>[] | null> {
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
    if (!res.ok) return null;
    const j = await res.json();
    return j.results?.bindings ?? [];
  } catch {
    return null;
  }
}

export type Ownership = { founders: string[]; parents: string[]; subsidiaries: string[] };

// Founders (P112), parent orgs (P749), subsidiaries (P355) for a company QID.
export async function getOwnership(qid: string): Promise<Ownership | null> {
  const q = `SELECT ?type ?vLabel WHERE {
    { wd:${qid} wdt:P112 ?v. BIND('founder' AS ?type) } UNION
    { wd:${qid} wdt:P749 ?v. BIND('parent' AS ?type) } UNION
    { wd:${qid} wdt:P355 ?v. BIND('sub' AS ?type) }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
  } LIMIT 40`;
  const rows = await sparql(q);
  if (!rows) return null;
  const founders: string[] = [], parents: string[] = [], subsidiaries: string[] = [];
  for (const r of rows) {
    const name = r.vLabel?.value;
    if (!name || /^Q\d+$/.test(name)) continue;
    const type = r.type?.value;
    if (type === "founder" && !founders.includes(name)) founders.push(name);
    else if (type === "parent" && !parents.includes(name)) parents.push(name);
    else if (type === "sub" && !subsidiaries.includes(name)) subsidiaries.push(name);
  }
  if (!founders.length && !parents.length && !subsidiaries.length) return null;
  return { founders, parents, subsidiaries: subsidiaries.slice(0, 8) };
}

export type Province = { name: string; gdpCny: number; rank: number };

// Q1615742 = province of the People's Republic of China. Take the max GDP (P2131)
// per province to collapse multiple point-in-time values.
export async function getProvinceGDP(limit = 15): Promise<Province[] | null> {
  const q = `SELECT ?provLabel (MAX(?gdp) AS ?maxGdp) WHERE {
    ?prov wdt:P31 wd:Q1615742. ?prov wdt:P2131 ?gdp.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
  } GROUP BY ?provLabel ORDER BY DESC(?maxGdp) LIMIT ${limit}`;
  const rows = await sparql(q);
  if (!rows) return null;
  return rows
    .map((r) => ({ name: r.provLabel?.value ?? "", gdpCny: Number(r.maxGdp?.value ?? 0) }))
    .filter((p) => p.name && p.gdpCny > 0 && !/^Q\d+$/.test(p.name))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export type Fair = { name: string; website: string; city: string };

// Q57305 = trade fair; P17 = country China (Q148). Prefer entries with a website.
export async function getTradeFairs(limit = 12): Promise<Fair[] | null> {
  const q = `SELECT ?fairLabel ?website ?cityLabel WHERE {
    ?fair wdt:P31 wd:Q57305. ?fair wdt:P17 wd:Q148.
    OPTIONAL { ?fair wdt:P856 ?website. }
    OPTIONAL { ?fair wdt:P276 ?city. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
  } LIMIT 60`;
  const rows = await sparql(q);
  if (!rows) return null;
  const seen = new Set<string>();
  const out: Fair[] = [];
  for (const r of rows) {
    const name = r.fairLabel?.value ?? "";
    if (!name || /^Q\d+$/.test(name) || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, website: r.website?.value ?? "", city: r.cityLabel?.value && !/^Q\d+$/.test(r.cityLabel.value) ? r.cityLabel.value : "" });
    if (out.length >= limit) break;
  }
  return out;
}
