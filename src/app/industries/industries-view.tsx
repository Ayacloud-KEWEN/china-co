"use client";

import Link from "next/link";
import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, Badge } from "@/components/ui";
import type { Industry } from "@/db/schema";

export function IndustriesView({ industries }: { industries: Industry[] }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.industries")} subtitle="市场规模、增长率、竞争格局、龙头企业、产业链、政策与 AI 预测。" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => (
          <Link key={ind.slug} href={`/industries/${ind.slug}`}>
            <Card className="h-full transition hover:border-accent hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{ind.icon}</span>
                <Badge tone="green">+{ind.growth}%</Badge>
              </div>
              <div className="mt-3 font-semibold">{lang === "en" ? ind.nameEn : ind.name}</div>
              <div className="text-xs text-muted">市场规模 {ind.marketSize}</div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{ind.summary[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{ind.leaders.slice(0, 3).map((l) => <Badge key={l}>{l}</Badge>)}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
