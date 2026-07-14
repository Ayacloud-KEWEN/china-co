"use server";

import { revalidatePath } from "next/cache";
import { spawn } from "node:child_process";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin";

type Result = { error?: string; ok?: boolean };

// --- FormData parsing helpers ---
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = parseInt(String(fd.get(k) ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
};
// Comma / newline separated → string[]
const list = (fd: FormData, k: string) =>
  String(fd.get(k) ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
const i18n = (fd: FormData, k: string) => ({
  zh: str(fd, `${k}_zh`),
  en: str(fd, `${k}_en`),
  fr: str(fd, `${k}_fr`),
});
// Sources: one per line, "Name | https://url"
const sources = (fd: FormData) =>
  String(fd.get("sources") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, url] = line.split("|").map((s) => s.trim());
      return { name: name || "", url: url || "" };
    })
    .filter((s) => s.name || s.url);

// Executives: one per line, "Name | Role"
const execs = (fd: FormData) =>
  String(fd.get("executives") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, role] = line.split("|").map((s) => s.trim());
      return { name: name || "", role: role || "" };
    })
    .filter((e) => e.name);

// Optional i18n block: returns null when all three languages are blank.
const i18nOpt = (fd: FormData, k: string) => {
  const v = { zh: str(fd, `${k}_zh`), en: str(fd, `${k}_en`), fr: str(fd, `${k}_fr`) };
  return v.zh || v.en || v.fr ? v : null;
};

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);

// ========================= Companies =========================

export async function saveCompany(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const name = str(fd, "name");
  if (!name) return { error: "中文名称必填" };

  const values = {
    slug,
    name,
    nameEn: str(fd, "nameEn"),
    industry: str(fd, "industry"),
    city: str(fd, "city"),
    founded: int(fd, "founded"),
    employees: str(fd, "employees"),
    revenue: str(fd, "revenue"),
    listed: str(fd, "listed"),
    logo: str(fd, "logo") || "🏢",
    tags: list(fd, "tags"),
    overview: i18n(fd, "overview"),
    exportMarkets: list(fd, "exportMarkets"),
    products: list(fd, "products"),
    competitors: list(fd, "competitors"),
    riskScore: int(fd, "riskScore"),
    growth: int(fd, "growth"),
    sources: sources(fd),
    executives: execs(fd),
  };

  try {
    if (prevSlug) {
      await db.update(schema.companies).set(values).where(eq(schema.companies.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.companies.slug }).from(schema.companies).where(eq(schema.companies.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.companies).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
  return { ok: true };
}

export async function deleteCompany(slug: string) {
  await requireAdmin();
  await db.delete(schema.companies).where(eq(schema.companies.slug, slug));
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
}

// ========================= Industries =========================

export async function saveIndustry(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const name = str(fd, "name");
  if (!name) return { error: "中文名称必填" };

  const values = {
    slug,
    name,
    nameEn: str(fd, "nameEn"),
    icon: str(fd, "icon") || "🏭",
    marketSize: str(fd, "marketSize"),
    growth: int(fd, "growth"),
    leaders: list(fd, "leaders"),
    cities: list(fd, "cities"),
    summary: i18n(fd, "summary"),
  };

  try {
    if (prevSlug) {
      await db.update(schema.industries).set(values).where(eq(schema.industries.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.industries.slug }).from(schema.industries).where(eq(schema.industries.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.industries).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/industries");
  revalidatePath("/industries");
  return { ok: true };
}

export async function deleteIndustry(slug: string) {
  await requireAdmin();
  await db.delete(schema.industries).where(eq(schema.industries.slug, slug));
  revalidatePath("/admin/industries");
  revalidatePath("/industries");
}

// ========================= Cities =========================

export async function saveCity(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const name = str(fd, "name");
  if (!name) return { error: "中文名称必填" };

  const values = {
    slug,
    name,
    nameEn: str(fd, "nameEn"),
    gdp: str(fd, "gdp"),
    pop: str(fd, "pop"),
    pillars: list(fd, "pillars"),
    leaders: list(fd, "leaders"),
    summary: i18n(fd, "summary"),
    officeRent: str(fd, "officeRent"),
    avgWage: str(fd, "avgWage"),
    fdi: str(fd, "fdi"),
  };

  try {
    if (prevSlug) {
      await db.update(schema.cities).set(values).where(eq(schema.cities.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.cities.slug }).from(schema.cities).where(eq(schema.cities.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.cities).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/cities");
  revalidatePath("/cities");
  return { ok: true };
}

export async function deleteCity(slug: string) {
  await requireAdmin();
  await db.delete(schema.cities).where(eq(schema.cities.slug, slug));
  revalidatePath("/admin/cities");
  revalidatePath("/cities");
}

// ========================= Policies =========================

const POLICY_IMPACT = ["高", "中", "低"] as const;

export async function savePolicy(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const impact = str(fd, "impact") as (typeof POLICY_IMPACT)[number];
  if (!POLICY_IMPACT.includes(impact)) return { error: "影响等级无效" };
  const title = i18n(fd, "title");
  if (!title.zh) return { error: "中文标题必填" };

  const values = {
    slug,
    org: str(fd, "org"),
    date: str(fd, "date"),
    impact,
    title,
    tags: list(fd, "tags"),
    summary: i18nOpt(fd, "summary"),
    sourceUrl: str(fd, "sourceUrl"),
    region: str(fd, "region"),
    effectiveDate: str(fd, "effectiveDate"),
  };

  try {
    if (prevSlug) {
      await db.update(schema.policies).set(values).where(eq(schema.policies.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.policies.slug }).from(schema.policies).where(eq(schema.policies.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.policies).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/policies");
  revalidatePath("/policy");
  return { ok: true };
}

export async function deletePolicy(slug: string) {
  await requireAdmin();
  await db.delete(schema.policies).where(eq(schema.policies.slug, slug));
  revalidatePath("/admin/policies");
  revalidatePath("/policy");
}

// ========================= Suppliers =========================

export async function saveSupplier(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const name = str(fd, "name");
  if (!name) return { error: "名称必填" };

  const values = {
    slug,
    name,
    category: str(fd, "category"),
    city: str(fd, "city"),
    products: list(fd, "products"),
    capacity: str(fd, "capacity"),
    certs: list(fd, "certs"),
    riskScore: int(fd, "riskScore"),
    exportMarkets: list(fd, "exportMarkets"),
  };

  try {
    if (prevSlug) {
      await db.update(schema.suppliers).set(values).where(eq(schema.suppliers.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.suppliers.slug }).from(schema.suppliers).where(eq(schema.suppliers.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.suppliers).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/suppliers");
  revalidatePath("/supply-chain");
  return { ok: true };
}

export async function deleteSupplier(slug: string) {
  await requireAdmin();
  await db.delete(schema.suppliers).where(eq(schema.suppliers.slug, slug));
  revalidatePath("/admin/suppliers");
  revalidatePath("/supply-chain");
}

// ========================= Ops: rebuild vector index =========================

// Guard against concurrent runs within a single server process.
let embedRunning = false;

export async function triggerReembed(): Promise<Result> {
  await requireAdmin();
  if (embedRunning) return { error: "向量索引重建已在进行中" };
  embedRunning = true;
  try {
    const child = spawn("npm", ["run", "db:embed"], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      shell: process.platform === "win32", // npm is a .cmd on Windows
      env: process.env,
    });
    child.on("exit", () => { embedRunning = false; });
    child.on("error", () => { embedRunning = false; });
    child.unref();
  } catch (e) {
    embedRunning = false;
    return { error: `触发失败：${(e as Error).message}` };
  }
  return { ok: true };
}
