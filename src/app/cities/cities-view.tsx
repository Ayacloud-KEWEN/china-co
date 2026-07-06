"use client";

import Link from "next/link";
import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import type { City, Province } from "@/db/schema";

export function CitiesView({ cities, provinces }: { cities: City[]; provinces: Province[] }) {
  const t = useT();
  const { lang } = useLang();
  const maxGdp = Math.max(...provinces.map((p) => Number(p.gdpCny)), 1);
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.cities")} subtitle="GDP、产业、龙头企业、工业园、人才、物流、营商环境与外资政策。" />

      {provinces.length > 0 && (
        <Card>
          <SectionTitle>省级 GDP 排行 · Wikidata（万亿元）</SectionTitle>
          <div className="space-y-1.5">
            {provinces.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-6 shrink-0 text-right text-xs text-muted">{p.rank}</div>
                <div className="w-20 shrink-0 truncate text-sm">{p.name}</div>
                <div className="h-3 flex-1 rounded-full bg-background">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${(Number(p.gdpCny) / maxGdp) * 100}%` }} />
                </div>
                <div className="w-16 shrink-0 text-right text-xs font-medium">¥{(Number(p.gdpCny) / 1e12).toFixed(2)}T</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted">来源：Wikidata SPARQL（P2131 nominal GDP）· 数据年份以 Wikidata 为准</div>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {cities.map((c) => (
          <Link key={c.slug} href={`/cities/${c.slug}`}>
            <Card className="h-full transition hover:border-accent hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">📍 {lang === "en" ? c.nameEn : c.name}</div>
                <Badge tone="blue">GDP {c.gdp}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{c.summary[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{c.pillars.map((p) => <Badge key={p}>{p}</Badge>)}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
