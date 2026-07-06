import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import {
  companies, industries, cities, playbooks, suppliers, policies, news, indicators,
} from "../lib/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("→ Clearing existing rows…");
  await db.delete(schema.companies);
  await db.delete(schema.industries);
  await db.delete(schema.cities);
  await db.delete(schema.playbooks);
  await db.delete(schema.suppliers);
  await db.delete(schema.policies);
  await db.delete(schema.news);
  await db.delete(schema.indicators);

  console.log("→ Seeding…");
  await db.insert(schema.companies).values(companies);
  await db.insert(schema.industries).values(industries);
  await db.insert(schema.cities).values(cities);
  await db.insert(schema.playbooks).values(playbooks);
  await db.insert(schema.suppliers).values(suppliers);
  await db.insert(schema.policies).values(policies);
  await db.insert(schema.news).values(news.map((n) => ({ title: n.title, source: n.source, time: n.time })));
  await db.insert(schema.indicators).values(indicators.map((i) => ({ label: i.label, value: i.value, trend: i.trend, up: i.up })));

  const counts = {
    companies: companies.length, industries: industries.length, cities: cities.length,
    playbooks: playbooks.length, suppliers: suppliers.length, policies: policies.length,
    news: news.length, indicators: indicators.length,
  };
  console.log("✓ Seeded:", counts);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
