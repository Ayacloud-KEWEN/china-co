"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, Badge } from "@/components/ui";
import { playbookCategories } from "@/lib/data";
import type { Playbook } from "@/db/schema";

const diffTone: Record<string, "green" | "amber" | "red"> = { 低: "green", 中: "amber", 高: "red" };

export function PlaybooksView({ playbooks }: { playbooks: Playbook[] }) {
  const t = useT();
  const { lang } = useLang();
  const [cat, setCat] = useState<string>("全部");
  const list = cat === "全部" ? playbooks : playbooks.filter((p) => p.category === cat);

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.playbooks")} subtitle="China Market Playbooks —— 不是静态文章，而是 AI 攻略平台。每个 Playbook 自动生成流程、时间、成本、风险与行动清单。" />

      <div className="flex flex-wrap gap-2">
        {["全部", ...playbookCategories].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-xs transition ${cat === c ? "border-accent bg-accent/10 text-accent" : "text-muted hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.slug} href={`/playbooks/${p.slug}`}>
            <Card className="h-full transition hover:border-accent hover:shadow-md">
              <div className="flex items-center justify-between">
                <Badge tone="blue">{p.category}</Badge>
                <Badge tone={diffTone[p.difficulty]}>{p.difficulty}难度</Badge>
              </div>
              <div className="mt-3 font-medium">{p.title[lang]}</div>
              <div className="mt-2 text-xs text-muted">⏱ {p.time} · 💰 {p.cost}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
