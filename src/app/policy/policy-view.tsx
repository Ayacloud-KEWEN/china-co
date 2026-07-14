"use client";

import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import type { Policy } from "@/db/schema";

const impactTone: Record<string, "red" | "amber" | "green"> = { 高: "red", 中: "amber", 低: "green" };

export function PolicyView({ policies }: { policies: Policy[] }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.policy")} subtitle="实时追踪国务院、商务部、工信部、海关、税务总局与地方政府政策，AI 自动总结、解读并生成合规建议。" />

      <SectionTitle>最新政策更新</SectionTitle>
      <div className="space-y-3">
        {policies.map((p) => (
          <Card key={p.slug}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{p.title[lang]}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span>{p.org} · {p.date}</span>
                  {p.region && <span>· 适用 {p.region}</span>}
                  {p.effectiveDate && <span>· 生效 {p.effectiveDate}</span>}
                </div>
              </div>
              <Badge tone={impactTone[p.impact]}>影响 {p.impact}</Badge>
            </div>
            {p.summary?.[lang] && <p className="mt-2 text-sm text-muted">{p.summary[lang]}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {p.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              {p.sourceUrl && (
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-accent hover:underline">原文 ↗</a>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>AI 政策解读 / 影响分析 / 合规建议</SectionTitle>
        <AiPanel
          mode="search"
          placeholder="询问某项政策的影响或合规要求…"
          suggestions={["数据出境合规要求", "外资准入负面清单解读", "跨境电商进口新规影响", "新能源补贴对欧洲车企影响"]}
        />
      </Card>
    </div>
  );
}
