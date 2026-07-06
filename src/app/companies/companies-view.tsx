"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang, useT } from "@/lib/i18n";
import { Card, Badge, RiskBadge, PageHeader } from "@/components/ui";
import type { Company } from "@/db/schema";

export function CompaniesView({ companies }: { companies: Company[] }) {
  const t = useT();
  const { lang } = useLang();
  const [q, setQ] = useState("");
  const list = companies.filter((c) =>
    (c.name + c.nameEn + c.industry + c.tags.join()).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.companies")} subtitle="每一家企业自动生成完整 AI 企业档案，所有数据支持来源引用。" />
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="搜索企业、行业、标签…"
        className="w-full rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link key={c.slug} href={`/companies/${c.slug}`}>
            <Card className="h-full transition hover:border-accent hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{c.logo}</div>
                <RiskBadge score={c.riskScore} />
              </div>
              <div className="mt-3 font-semibold">{lang === "en" ? c.nameEn : c.name}</div>
              <div className="text-xs text-muted">{c.industry} · {c.city} · {c.founded}</div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{c.overview[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
