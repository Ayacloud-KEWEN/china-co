import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";

export const getCompanies = () => db.select().from(schema.companies);
export const getIndustries = () => db.select().from(schema.industries);
export const getCities = () => db.select().from(schema.cities);
export const getPlaybooks = () => db.select().from(schema.playbooks);
export const getSuppliers = () => db.select().from(schema.suppliers);
export const getPolicies = () => db.select().from(schema.policies);
export const getNews = () => db.select().from(schema.news);
export const getIndicators = () => db.select().from(schema.indicators);
export const getFx = () => db.select().from(schema.fx);
export const getProvinces = () => db.select().from(schema.provinces);
export const getFairs = () => db.select().from(schema.fairs);
export const getTenders = () => db.select().from(schema.tenders);

// The whole province→city→district tree (~3.4k rows). Only the columns the tree
// UI needs, so the client payload stays small enough to ship in one go.
export const getDivisionTree = () =>
  db.select({
    code: schema.divisions.code,
    parentCode: schema.divisions.parentCode,
    level: schema.divisions.level,
    name: schema.divisions.name,
    citySlug: schema.divisions.citySlug,
  }).from(schema.divisions).orderBy(schema.divisions.code);

export type DivisionNode = Awaited<ReturnType<typeof getDivisionTree>>[number];

export const getDivisions = () => db.select().from(schema.divisions).orderBy(schema.divisions.code);

async function one<T>(rows: Promise<T[]>): Promise<T | undefined> {
  return (await rows)[0];
}

// News headlines linked to a specific entity during ingest (best-effort match).
export const getNewsForEntity = (entityType: string, entitySlug: string) =>
  db.select().from(schema.news)
    .where(and(eq(schema.news.entityType, entityType), eq(schema.news.entitySlug, entitySlug)));

export const getDivision = (code: string) =>
  one(db.select().from(schema.divisions).where(eq(schema.divisions.code, code)));

// A division plus its ancestor chain (province → … → self), derived from the
// GB code prefixes rather than recursive SQL: 2 / 4 / 6 / 9 digits.
export async function getDivisionWithPath(code: string) {
  const prefixes = [2, 4, 6, 9].filter((n) => n < code.length).map((n) => code.slice(0, n));
  const [self, ancestors, children] = await Promise.all([
    getDivision(code),
    prefixes.length
      ? db.select().from(schema.divisions).where(inArray(schema.divisions.code, prefixes)).orderBy(schema.divisions.code)
      : Promise.resolve([]),
    db.select().from(schema.divisions).where(eq(schema.divisions.parentCode, code)).orderBy(schema.divisions.code),
  ]);
  return self ? { division: self, ancestors, children } : undefined;
}

export const getCompany = (slug: string) =>
  one(db.select().from(schema.companies).where(eq(schema.companies.slug, slug)));
export const getIndustryBySlug = (slug: string) =>
  one(db.select().from(schema.industries).where(eq(schema.industries.slug, slug)));
export const getCityBySlug = (slug: string) =>
  one(db.select().from(schema.cities).where(eq(schema.cities.slug, slug)));
export const getPlaybookBySlug = (slug: string) =>
  one(db.select().from(schema.playbooks).where(eq(schema.playbooks.slug, slug)));
export const getSupplierBySlug = (slug: string) =>
  one(db.select().from(schema.suppliers).where(eq(schema.suppliers.slug, slug)));
export const getPolicyBySlug = (slug: string) =>
  one(db.select().from(schema.policies).where(eq(schema.policies.slug, slug)));

// Inferred row types for passing DB data into client components.
export type CompanyRow = typeof schema.companies.$inferSelect;
export type IndustryRow = typeof schema.industries.$inferSelect;
export type CityRow = typeof schema.cities.$inferSelect;
export type PlaybookRow = typeof schema.playbooks.$inferSelect;
export type SupplierRow = typeof schema.suppliers.$inferSelect;
export type PolicyRow = typeof schema.policies.$inferSelect;
export type NewsRow = typeof schema.news.$inferSelect;
export type IndicatorRow = typeof schema.indicators.$inferSelect;
