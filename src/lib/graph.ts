import "server-only";
import { db, schema } from "@/db";

// Builds a knowledge graph from the ingested data: companies and their industry,
// HQ city, competitors, export markets and key suppliers.

export type GraphNode = { id: string; label: string; kind: string; url?: string };
export type GraphEdge = { from: string; to: string; label: string };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export async function buildGraph(): Promise<Graph> {
  const [companies, industries, cities, suppliers] = await Promise.all([
    db.select().from(schema.companies),
    db.select().from(schema.industries),
    db.select().from(schema.cities),
    db.select().from(schema.suppliers),
  ]);

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const add = (id: string, label: string, kind: string, url?: string) => {
    if (!nodes.has(id)) nodes.set(id, { id, label, kind, url });
  };
  const link = (from: string, to: string, label: string) => {
    if (nodes.has(from) && nodes.has(to) && from !== to) edges.push({ from, to, label });
  };

  const cityBySlug = new Map(cities.map((c) => [c.name, c]));
  const industryByName = new Map(industries.map((i) => [i.name, i]));
  const companyByName = new Map(companies.map((c) => [c.name, c]));

  for (const c of companies) add(`co:${c.slug}`, c.name, "企业", `/companies/${c.slug}`);
  for (const i of industries) add(`ind:${i.slug}`, i.name, "行业", `/industries/${i.slug}`);
  for (const c of cities) add(`city:${c.slug}`, c.name, "城市", `/cities/${c.slug}`);

  for (const c of companies) {
    // Company → industry
    const ind = industryByName.get(c.industry);
    if (ind) { add(`ind:${ind.slug}`, ind.name, "行业", `/industries/${ind.slug}`); link(`co:${c.slug}`, `ind:${ind.slug}`, "属于"); }
    // Company → HQ city
    const city = cityBySlug.get(c.city);
    if (city) link(`co:${c.slug}`, `city:${city.slug}`, "总部");
    // Company → competitor (only when the competitor is another known company)
    for (const comp of c.competitors) {
      const other = companyByName.get(comp);
      if (other && other.slug !== c.slug) link(`co:${c.slug}`, `co:${other.slug}`, "竞争");
    }
    // Company → export markets
    for (const m of c.exportMarkets.slice(0, 4)) {
      add(`mkt:${m}`, m, "市场");
      link(`co:${c.slug}`, `mkt:${m}`, "出口");
    }
    // Ownership (Wikidata): founders / parents / subsidiaries
    if (c.ownership) {
      for (const f of c.ownership.founders) { add(`per:${f}`, f, "创始人"); link(`per:${f}`, `co:${c.slug}`, "创立"); }
      for (const p of c.ownership.parents) { add(`org:${p}`, p, "母公司"); link(`org:${p}`, `co:${c.slug}`, "控股"); }
      for (const s of c.ownership.subsidiaries.slice(0, 5)) { add(`org:${s}`, s, "子公司"); link(`co:${c.slug}`, `org:${s}`, "子公司"); }
    }
  }

  // Suppliers → HQ city (they live in Chinese cities)
  for (const s of suppliers) {
    add(`sup:${s.slug}`, s.name, "供应商", `/supply-chain`);
    const city = cityBySlug.get(s.city);
    if (city) link(`sup:${s.slug}`, `city:${city.slug}`, "位于");
  }

  // Drop isolated market/supplier nodes with no edges to keep it tidy.
  const degree = new Map<string, number>();
  for (const e of edges) { degree.set(e.from, (degree.get(e.from) ?? 0) + 1); degree.set(e.to, (degree.get(e.to) ?? 0) + 1); }
  const kept = [...nodes.values()].filter((n) => (degree.get(n.id) ?? 0) > 0);

  return { nodes: kept, edges };
}
