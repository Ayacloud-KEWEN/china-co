"use server";

import { revalidatePath } from "next/cache";
import { spawn } from "node:child_process";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { lookupCityByName } from "@/lib/sources/wikidata-sparql";
import { fanoutPolicyNotifications } from "@/lib/notifications";

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

// Pipe-pair lines "a | b" → {[k1]: a, [k2]: b}[] (drops rows with an empty first field).
const pairs = <A extends string, B extends string>(fd: FormData, key: string, k1: A, k2: B) =>
  String(fd.get(key) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split("|").map((s) => s.trim());
      return { [k1]: a || "", [k2]: b || "" } as Record<A | B, string>;
    })
    .filter((o) => o[k1]);

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

// ========================= Divisions =========================

// Structure (code/parent/level) comes from the GB/T 2260 seed and is never
// edited here — only the intel fields and the optional link to a city page.
export async function saveDivision(code: string, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return { error: "名称必填" };
  const citySlug = str(fd, "citySlug").toLowerCase();
  if (citySlug) {
    const hit = await db.select({ slug: schema.cities.slug }).from(schema.cities).where(eq(schema.cities.slug, citySlug)).limit(1);
    if (!hit.length) return { error: `城市 slug「${citySlug}」不存在` };
  }

  // Any admin edit to the text makes it hand-written, so drop the "wikipedia"
  // marker — the importer only ever replaces summaries it wrote itself.
  const [before] = await db.select({ summary: schema.divisions.summary, source: schema.divisions.summarySource })
    .from(schema.divisions).where(eq(schema.divisions.code, code)).limit(1);
  const summary = i18nOpt(fd, "summary");
  const changed = JSON.stringify(summary) !== JSON.stringify(before?.summary ?? null);

  try {
    await db.update(schema.divisions).set({
      name,
      nameEn: str(fd, "nameEn"),
      gdp: str(fd, "gdp"),
      pop: str(fd, "pop"),
      area: str(fd, "area"),
      website: str(fd, "website"),
      postcode: str(fd, "postcode"),
      dialCode: str(fd, "dialCode"),
      pillars: list(fd, "pillars"),
      summary,
      summarySource: changed ? "" : (before?.source ?? ""),
      notes: str(fd, "notes"),
      citySlug: citySlug || null,
    }).where(eq(schema.divisions.code, code));
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/divisions");
  revalidatePath("/cities");
  revalidatePath(`/cities/area/${code}`);
  return { ok: true };
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

  let created = false;
  try {
    if (prevSlug) {
      await db.update(schema.policies).set(values).where(eq(schema.policies.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.policies.slug }).from(schema.policies).where(eq(schema.policies.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.policies).values(values);
      created = true;
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }

  // Alert subscribers whose keywords match this newly-published policy.
  if (created) {
    const [row] = await db.select().from(schema.policies).where(eq(schema.policies.slug, slug)).limit(1);
    if (row) {
      const n = await fanoutPolicyNotifications(row).catch(() => 0);
      if (n) revalidatePath("/");
    }
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

// ========================= Playbooks =========================

const PLAYBOOK_DIFF = ["低", "中", "高"] as const;

export async function savePlaybook(prevSlug: string | null, _prev: Result | null, fd: FormData): Promise<Result> {
  await requireAdmin();
  const slug = str(fd, "slug").toLowerCase();
  if (!slugOk(slug)) return { error: "slug 只能包含小写字母、数字和连字符" };
  const difficulty = str(fd, "difficulty") as (typeof PLAYBOOK_DIFF)[number];
  if (!PLAYBOOK_DIFF.includes(difficulty)) return { error: "难度无效" };
  const title = i18n(fd, "title");
  if (!title.zh) return { error: "中文标题必填" };

  const values = {
    slug,
    category: str(fd, "category") || "市场进入",
    title,
    time: str(fd, "time"),
    cost: str(fd, "cost"),
    difficulty,
    summary: i18nOpt(fd, "summary"),
    steps: pairs(fd, "steps", "title", "detail"),
    documents: list(fd, "documents"),
    departments: list(fd, "departments"),
    risks: list(fd, "risks"),
    tips: list(fd, "tips"),
    faq: pairs(fd, "faq", "q", "a"),
    relatedCities: list(fd, "relatedCities"),
    sourceUrl: str(fd, "sourceUrl"),
  };

  try {
    if (prevSlug) {
      await db.update(schema.playbooks).set(values).where(eq(schema.playbooks.slug, prevSlug));
    } else {
      const existing = await db.select({ slug: schema.playbooks.slug }).from(schema.playbooks).where(eq(schema.playbooks.slug, slug)).limit(1);
      if (existing.length) return { error: "该 slug 已存在" };
      await db.insert(schema.playbooks).values(values);
    }
  } catch (e) {
    return { error: `保存失败：${(e as Error).message}` };
  }
  revalidatePath("/admin/playbooks");
  revalidatePath("/playbooks");
  return { ok: true };
}

export async function deletePlaybook(slug: string) {
  await requireAdmin();
  await db.delete(schema.playbooks).where(eq(schema.playbooks.slug, slug));
  revalidatePath("/admin/playbooks");
  revalidatePath("/playbooks");
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

// ========================= City wizard: Wikidata lookup =========================

type CityPrefill = { slug: string; name: string; nameEn: string; gdp: string; pop: string };

const fmtPop = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
// Only trust a GDP figure large enough to plausibly be CNY for a real city.
const fmtGdpCny = (n: number): string =>
  n < 1e11 ? "" : n >= 1e12 ? `¥${(n / 1e12).toFixed(2)}T` : `¥${Math.round(n / 1e8).toLocaleString()}亿`;

export async function lookupCity(name: string): Promise<{ data?: CityPrefill; error?: string }> {
  await requireAdmin();
  if (!name.trim()) return { error: "请输入城市名" };
  const r = await lookupCityByName(name.trim());
  if (!r) return { error: "在 Wikidata 未找到该城市，请换个名称或从空白开始" };
  const nameZh = r.nameZh.replace(/市$/, "") || name.trim(); // 深圳市 → 深圳
  return {
    data: {
      slug: (r.nameEn || nameZh).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: nameZh,
      nameEn: r.nameEn,
      gdp: r.gdpCny ? fmtGdpCny(r.gdpCny) : "",
      pop: r.population ? fmtPop(r.population) : "",
    },
  };
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
