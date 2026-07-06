"use client";

import Link from "next/link";
import { useLang, useT } from "@/lib/i18n";
import { AiPanel } from "@/components/ai-panel";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { ChinaMap } from "@/components/china-map";
import { MapEmbed } from "@/components/map-embed";
import type { News, Indicator, Industry, Company, Policy, Playbook, Fx, City } from "@/db/schema";

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full">
      <polyline points={pts} fill="none" stroke={up ? "var(--color-accent, #2563eb)" : "#ef4444"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const curFlag: Record<string, string> = { EUR: "🇪🇺", USD: "🇺🇸", GBP: "🇬🇧", JPY: "🇯🇵" };

export function HomeView({ news, indicators, industries, companies, policies, playbooks, fx, cities }: {
  news: News[]; indicators: Indicator[]; industries: Industry[];
  companies: Company[]; policies: Policy[]; playbooks: Playbook[]; fx: Fx[]; cities: City[];
}) {
  const t = useT();
  const { lang } = useLang();
  const cityMarkers = cities
    .filter((c) => c.geo)
    .map((c) => ({ lat: c.geo!.lat, lon: c.geo!.lon, label: c.name, sub: `${c.pois?.length ?? 0} 个工业区 · GDP ${c.gdp}` }));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/5 via-surface to-surface p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("hero.title")}</h1>
        <p className="mt-3 text-lg text-muted">
          <span className="font-medium text-foreground">{t("hero.l1")}</span>{" "}
          <span className="font-medium text-foreground">{t("hero.l2")}</span>{" "}
          <span className="font-medium text-foreground">{t("hero.l3")}</span>
        </p>
        <div className="mt-6">
          <AiPanel mode="search" suggestions={["华为", "BYD", "机器人市场", "如何进入中国市场", "寻找 ODM 工厂", "比较华为和中兴"]} />
        </div>
      </section>

      <section>
        <SectionTitle>{t("home.indicators")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {indicators.map((ind) => (
            <div key={ind.id} className="rounded-xl border bg-surface p-4">
              <div className="text-xs text-muted">{ind.label[lang]}</div>
              <div className="mt-1 text-xl font-semibold">{ind.value}</div>
              <div className={`mt-0.5 text-xs font-medium ${ind.up ? "text-emerald-500" : "text-red-500"}`}>{ind.up ? "▲" : "▼"} {ind.trend}</div>
              {ind.series && ind.series.length > 1 && (
                <div className="mt-1"><Sparkline data={ind.series.map((s) => s.value)} up={ind.up} /></div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-[11px] text-muted">近 12 年趋势 · World Bank</div>
      </section>

      {fx.length > 0 && (
        <section>
          <SectionTitle>
            人民币汇率 · 30 日走势（ECB / Frankfurter{fx[0]?.date ? ` · ${fx[0].date}` : ""}）
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fx.map((r) => (
              <div key={r.cur} className="rounded-xl border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{curFlag[r.cur]} 1 {r.cur}</span>
                  <span className={`text-xs font-medium ${r.up ? "text-emerald-500" : "text-red-500"}`}>{r.changePct}</span>
                </div>
                <div className="mt-1 text-xl font-semibold">¥{r.cnyPer}</div>
                <div className="mt-1"><Sparkline data={r.spark} up={r.up} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>{t("home.news")}</SectionTitle>
          <ul className="divide-y">
            {news.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                <span className="text-sm">{n.title[lang]}</span>
                <span className="shrink-0 text-xs text-muted">{n.source} · {n.time}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle>{t("home.map")}</SectionTitle>
          {cityMarkers.length > 0 ? (
            <MapEmbed center={[32, 110]} zoom={4} markers={cityMarkers} height={300} />
          ) : (
            <ChinaMap />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle action={<Link href="/industries" className="text-xs text-accent">{t("common.viewAll")}</Link>}>{t("home.hotIndustries")}</SectionTitle>
          <div className="space-y-2">
            {industries.slice(0, 4).map((ind) => (
              <Link key={ind.slug} href={`/industries/${ind.slug}`} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-background">
                <span className="text-sm">{ind.icon} {lang === "en" ? ind.nameEn : ind.name}</span>
                <Badge tone="green">+{ind.growth}%</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle action={<Link href="/companies" className="text-xs text-accent">{t("common.viewAll")}</Link>}>{t("home.hotCompanies")}</SectionTitle>
          <div className="space-y-2">
            {companies.slice(0, 4).map((c) => (
              <Link key={c.slug} href={`/companies/${c.slug}`} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-background">
                <span className="text-sm">{c.logo} {lang === "en" ? c.nameEn : c.name}</span>
                <span className="text-xs text-muted">{c.industry}</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle action={<Link href="/policy" className="text-xs text-accent">{t("common.viewAll")}</Link>}>{t("home.policy")}</SectionTitle>
          <div className="space-y-2">
            {policies.slice(0, 4).map((p) => (
              <div key={p.slug} className="rounded-lg px-2 py-2 hover:bg-background">
                <div className="text-sm">{p.title[lang]}</div>
                <div className="mt-0.5 text-xs text-muted">{p.org} · {p.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle action={<Link href="/playbooks" className="text-xs text-accent">{t("common.viewAll")}</Link>}>{t("home.playbooks")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/playbooks/${p.slug}`} className="rounded-lg border p-3 hover:border-accent">
              <Badge tone="blue">{p.category}</Badge>
              <div className="mt-2 text-sm font-medium">{p.title[lang]}</div>
              <div className="mt-1 text-xs text-muted">⏱ {p.time} · 💰 {p.cost}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
