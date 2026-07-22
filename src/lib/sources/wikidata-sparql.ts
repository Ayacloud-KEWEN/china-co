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

// POST variant: the division lookups send ~250 codes per query, far past what a
// GET URL can carry. Retries because WDQS returns transient 502/504 under load.
async function sparqlPost(query: string, tries = 4): Promise<Record<string, { value: string }>[]> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "User-Agent": UA, Accept: "application/sparql-results+json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ query }),
        signal: AbortSignal.timeout(90_000),
      });
      if (res.ok) return (await res.json()).results?.bindings ?? [];
    } catch {
      // fall through to the backoff below
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return [];
}

export type DivisionStats = { population: number; areaKm2: number; nameEn: string };

// Population (P1082), area (P2046) and the English label for a batch of GB/T 2260
// division codes, keyed by P442 (China administrative division code).
//
// Two quirks handled here:
//  - Wikidata writes the code in 2-digit groups ("44 03 03"), but some items use
//    the bare form, so each code is matched both ways and the hits merged.
//  - An item carries one population per census year; MAX takes the most recent
//    (values only ever grow in the census series we get back).
//
// Codes absent from the result simply have no Wikidata item — the caller leaves
// those rows untouched rather than guessing.
export async function getDivisionStats(codes: string[], onProgress?: (done: number, matched: number) => void): Promise<Map<string, DivisionStats>> {
  const spaced = (c: string) => (c.match(/.{1,2}/g) ?? []).join(" ");
  const out = new Map<string, DivisionStats>();
  const CHUNK = 250;

  for (let i = 0; i < codes.length; i += CHUNK) {
    const batch = codes.slice(i, i + CHUNK);
    const values = batch.flatMap((c) => [`"${spaced(c)}"`, `"${c}"`]).join(" ");
    const q = `SELECT ?code (MAX(?pop) AS ?p) (MAX(?area) AS ?a) (SAMPLE(?enL) AS ?en) WHERE {
      VALUES ?code { ${values} }
      ?item wdt:P442 ?code.
      OPTIONAL { ?item wdt:P1082 ?pop. }
      OPTIONAL { ?item wdt:P2046 ?area. }
      OPTIONAL { ?item rdfs:label ?enL. FILTER(LANG(?enL)="en") }
    } GROUP BY ?code`;

    for (const r of await sparqlPost(q)) {
      const code = (r.code?.value ?? "").replace(/\s+/g, "");
      if (!code) continue;
      const prev = out.get(code);
      out.set(code, {
        population: Math.max(Number(r.p?.value ?? 0), prev?.population ?? 0),
        areaKm2: Math.max(Number(r.a?.value ?? 0), prev?.areaKm2 ?? 0),
        nameEn: r.en?.value || prev?.nameEn || "",
      });
    }
    onProgress?.(Math.min(i + CHUNK, codes.length), out.size);
  }
  return out;
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

export type CityStats = { population: number | null; gdpCny: number | null };

// Population (P1082) and nominal GDP (P2131) for a city QID. Takes MAX to collapse
// point-in-time values. GDP units on Wikidata are inconsistent across cities, so
// the caller guards the magnitude before trusting it; population is a plain count.
export async function getCityStats(qid: string): Promise<CityStats | null> {
  const q = `SELECT (MAX(?pop) AS ?maxPop) (MAX(?gdp) AS ?maxGdp) WHERE {
    OPTIONAL { wd:${qid} wdt:P1082 ?pop. }
    OPTIONAL { wd:${qid} wdt:P2131 ?gdp. }
  }`;
  const rows = await sparql(q);
  if (!rows || !rows.length) return null;
  const r = rows[0];
  const pop = Number(r.maxPop?.value ?? 0);
  const gdp = Number(r.maxGdp?.value ?? 0);
  return { population: pop > 0 ? pop : null, gdpCny: gdp > 0 ? gdp : null };
}

export type CityLookup = { qid: string; nameZh: string; nameEn: string; population: number | null; gdpCny: number | null };

// Resolve a city by (Chinese or English) name via the Wikidata search API, then
// SPARQL the candidates for the one that is actually a city (P31/P279* Q515) with
// the largest population — avoids matching a same-named person/company/district.
export async function lookupCityByName(name: string): Promise<CityLookup | null> {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=zh&uselang=zh&format=json&type=item&limit=5&origin=*`;
  let ids: string[] = [];
  try {
    const res = await fetch(searchUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const j = await res.json();
    ids = (j.search ?? []).map((s: { id: string }) => s.id).filter(Boolean);
  } catch {
    return null;
  }
  if (!ids.length) return null;

  const values = ids.map((id) => `wd:${id}`).join(" ");
  const q = `SELECT ?c ?zh ?en (MAX(?pop) AS ?p) (MAX(?gdp) AS ?g) WHERE {
    VALUES ?c { ${values} }
    ?c wdt:P31/wdt:P279* wd:Q515.
    OPTIONAL { ?c wdt:P1082 ?pop. }
    OPTIONAL { ?c wdt:P2131 ?gdp. }
    OPTIONAL { ?c rdfs:label ?zh. FILTER(LANG(?zh)="zh") }
    OPTIONAL { ?c rdfs:label ?en. FILTER(LANG(?en)="en") }
  } GROUP BY ?c ?zh ?en`;
  const rows = await sparql(q);
  if (!rows || !rows.length) return null;

  // Prefer the most populous matching city.
  const best = rows
    .map((r) => ({
      qid: (r.c?.value ?? "").split("/").pop() ?? "",
      nameZh: r.zh?.value ?? "",
      nameEn: r.en?.value ?? "",
      population: Number(r.p?.value ?? 0) || null,
      gdpCny: Number(r.g?.value ?? 0) || null,
    }))
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
  return best?.qid ? best : null;
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
