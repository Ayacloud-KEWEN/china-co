import { pgTable, text, integer, jsonb, boolean, serial, vector, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// --- Accounts & multi-tenancy ---

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  orgId: integer("org_id").notNull(),
  role: text("role").notNull().default("member"), // owner | member
  isAdmin: boolean("is_admin").notNull().default(false), // platform admin (backend console)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// --- User data (per-user, org-scoped) ---

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orgId: integer("org_id").notNull(),
  entityType: text("entity_type").notNull(), // company | industry | city
  entitySlug: text("entity_slug").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("watch_uniq").on(t.userId, t.entityType, t.entitySlug)]);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orgId: integer("org_id").notNull(),
  entityType: text("entity_type").notNull(),
  entitySlug: text("entity_slug").notNull(),
  body: text("body").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("note_uniq").on(t.userId, t.entityType, t.entitySlug)]);

export const savedAnalyses = pgTable("saved_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orgId: integer("org_id").notNull(),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  mode: text("mode").notNull(),
  content: text("content").notNull(),
  shared: boolean("shared").notNull().default(false), // shared with the org
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Watchlist = typeof watchlist.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;


// Trilingual text stored as JSONB: { zh, en, fr }
type I18nText = { zh: string; en: string; fr: string };
type Source = { name: string; url: string };

export const companies = pgTable("companies", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  industry: text("industry").notNull(),
  city: text("city").notNull(),
  founded: integer("founded").notNull(),
  employees: text("employees").notNull(),
  revenue: text("revenue").notNull(),
  listed: text("listed").notNull(),
  logo: text("logo").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  overview: jsonb("overview").$type<I18nText>().notNull(),
  exportMarkets: jsonb("export_markets").$type<string[]>().notNull(),
  products: jsonb("products").$type<string[]>().notNull(),
  competitors: jsonb("competitors").$type<string[]>().notNull(),
  riskScore: integer("risk_score").notNull(),
  growth: integer("growth").notNull(),
  sources: jsonb("sources").$type<Source[]>().notNull(),
  // Enriched from Google Patents (nullable until ingested).
  patents: jsonb("patents").$type<PatentPortfolio>(),
  // Enriched from Yahoo Finance (nullable; only for listed companies).
  financials: jsonb("financials").$type<Financials>(),
  // 5-year monthly close price history (Yahoo). {t:"YYYY-MM", c:number}
  priceHistory: jsonb("price_history").$type<{ t: string; c: number }[]>(),
  // Ownership from Wikidata: founders / parents / subsidiaries (names).
  ownership: jsonb("ownership").$type<{ founders: string[]; parents: string[]; subsidiaries: string[] }>(),
  // Leadership: chairman / CEO / founders (name + role). Admin-editable.
  executives: jsonb("executives").$type<{ name: string; role: string }[]>(),
});

type PatentPortfolio = {
  assignee: string;
  total: number;
  top: { number: string; title: string; url: string }[];
  searchUrl: string;
};

type Financials = {
  symbol: string; currency: string; exchange: string; asOf: string;
  price: number | null; changePct: number | null; marketCap: number | null;
  pe: number | null; pb: number | null; eps: number | null;
  week52High: number | null; week52Low: number | null;
  revenue: number | null; revenueGrowth: number | null;
  grossMargin: number | null; profitMargin: number | null; roe: number | null;
};

type ResearchTrend = { query: string; total: number; series: { year: number; count: number }[] };
type TradeFlow = { hs: string; year: number; exportUSD: number; topPartners: { name: string; valueUSD: number }[]; history?: { year: number; exportUSD: number }[] };
type Geo = { lat: number; lon: number };
type Poi = { name: string; lat: number; lon: number };

export const industries = pgTable("industries", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon").notNull(),
  marketSize: text("market_size").notNull(),
  growth: integer("growth").notNull(),
  leaders: jsonb("leaders").$type<string[]>().notNull(),
  cities: jsonb("cities").$type<string[]>().notNull(),
  summary: jsonb("summary").$type<I18nText>().notNull(),
  // Enriched from real sources (nullable until ingested).
  research: jsonb("research").$type<ResearchTrend>(),   // OpenAlex
  trade: jsonb("trade").$type<TradeFlow>(),             // UN Comtrade
});

export const cities = pgTable("cities", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  gdp: text("gdp").notNull(),
  pop: text("pop").notNull(),
  pillars: jsonb("pillars").$type<string[]>().notNull(),
  leaders: jsonb("leaders").$type<string[]>().notNull(),
  summary: jsonb("summary").$type<I18nText>().notNull(),
  // Enriched from OpenStreetMap / Overpass (nullable until ingested).
  geo: jsonb("geo").$type<Geo>(),
  pois: jsonb("pois").$type<Poi[]>(),
  // Business-cost signals for market-entry decisions. Admin-editable.
  officeRent: text("office_rent").notNull().default(""),
  avgWage: text("avg_wage").notNull().default(""),
  fdi: text("fdi").notNull().default(""),
});

export const playbooks = pgTable("playbooks", {
  slug: text("slug").primaryKey(),
  category: text("category").notNull(),
  title: jsonb("title").$type<I18nText>().notNull(),
  time: text("time").notNull(),
  cost: text("cost").notNull(),
  difficulty: text("difficulty").$type<"低" | "中" | "高">().notNull(),
});

export const suppliers = pgTable("suppliers", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  products: jsonb("products").$type<string[]>().notNull(),
  capacity: text("capacity").notNull(),
  certs: jsonb("certs").$type<string[]>().notNull(),
  riskScore: integer("risk_score").notNull(),
  exportMarkets: jsonb("export_markets").$type<string[]>().notNull(),
});

export const policies = pgTable("policies", {
  slug: text("slug").primaryKey(),
  org: text("org").notNull(),
  date: text("date").notNull(),
  impact: text("impact").$type<"高" | "中" | "低">().notNull(),
  title: jsonb("title").$type<I18nText>().notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  // Enrichment: trilingual summary, original source link, applicable region,
  // effective date. Admin-editable.
  summary: jsonb("summary").$type<I18nText>(),
  sourceUrl: text("source_url").notNull().default(""),
  region: text("region").notNull().default(""),
  effectiveDate: text("effective_date").notNull().default(""),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: jsonb("title").$type<I18nText>().notNull(),
  source: text("source").notNull(),
  time: text("time").notNull(),
  // Enrichment: original article link + best-effort entity linking (matched
  // against known company/industry/city names during ingest).
  url: text("url").notNull().default(""),
  entityType: text("entity_type"),   // company | industry | city | null
  entitySlug: text("entity_slug"),
});

export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  label: jsonb("label").$type<I18nText>().notNull(),
  value: text("value").notNull(),
  trend: text("trend").notNull(),
  up: boolean("up").notNull(),
  // ~12-year history for trend charts (World Bank). {year, value}
  series: jsonb("series").$type<{ year: string; value: number }[]>(),
});

export const provinces = pgTable("provinces", {
  name: text("name").primaryKey(),
  gdpCny: text("gdp_cny").notNull(),   // stored as string to preserve precision
  rank: integer("rank").notNull(),
});

export const fairs = pgTable("fairs", {
  name: text("name").primaryKey(),
  website: text("website").notNull().default(""),
  city: text("city").notNull().default(""),
});

export const tenders = pgTable("tenders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  country: text("country").notNull().default(""),
  noticeDate: text("notice_date").notNull().default(""),
  deadline: text("deadline").notNull().default(""),
  url: text("url").notNull(),
});

// RAG document store with pgvector embeddings (384-dim, multilingual-e5-small).
export const ragDocs = pgTable("rag_docs", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 384 }).notNull(),
});

export const fx = pgTable("fx", {
  cur: text("cur").primaryKey(),          // EUR / USD / GBP / JPY
  cnyPer: text("cny_per").notNull(),      // "7.73" — CNY per 1 unit
  changePct: text("change_pct").notNull(),
  up: boolean("up").notNull(),
  spark: jsonb("spark").$type<number[]>().notNull(),
  date: text("date").notNull(),
});

// Inferred row types — safe to import from client components (types are erased).
export type Company = typeof companies.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Playbook = typeof playbooks.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type News = typeof news.$inferSelect;
export type Indicator = typeof indicators.$inferSelect;
export type Fx = typeof fx.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type Fair = typeof fairs.$inferSelect;
export type Tender = typeof tenders.$inferSelect;
