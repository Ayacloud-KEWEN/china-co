"use client";

import { useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import type { Fair, Tender } from "@/db/schema";
import { CalendarDays, Gavel, ExternalLink } from "lucide-react";

// Official Chinese public-procurement platforms. China's domestic tenders have
// no open/free API, so we link users to the authoritative sources directly.
const cnProcurement = [
  { name: "中国政府采购网", desc: "财政部指定政府采购信息发布媒体", url: "https://www.ccgp.gov.cn" },
  { name: "中国招标投标公共服务平台", desc: "国家发改委招投标公共服务平台", url: "https://www.cebpubservice.com" },
  { name: "全国公共资源交易平台", desc: "工程建设、政府采购、土地矿权等", url: "http://www.ggzy.gov.cn" },
  { name: "中央政府采购网", desc: "中央国家机关政府采购", url: "http://www.zycg.gov.cn" },
];

export function OpportunitiesView({ fairs, tenders }: { fairs: Fair[]; tenders: Tender[] }) {
  const t = useT();
  return (
    <div className="space-y-8">
      <PageHeader title={t("nav.opportunities")} subtitle="展会日历、政府采购与招投标情报 —— 帮助欧洲企业发现进入中国市场的商机与合作入口。" />

      {/* Trade fairs */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> 重点展会 · Wikidata</span>
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fairs.map((f) => (
            <Card key={f.name} className="flex h-full flex-col">
              <div className="flex-1">
                <div className="font-medium">{f.name}</div>
                {f.city && <div className="mt-1 text-xs text-muted">📍 {f.city}</div>}
              </div>
              {f.website ? (
                <a href={f.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  官网 <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="mt-3 text-xs text-muted">暂无官网</span>
              )}
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted">来源：Wikidata（trade fair @ China）· 官网链接来自 Wikidata P856</div>
      </section>

      {/* Procurement directory */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5"><Gavel className="h-4 w-4" /> 中国政府采购 / 招投标平台</span>
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {cnProcurement.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="block rounded-xl border bg-surface p-4 transition hover:border-accent hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <ExternalLink className="h-4 w-4 text-muted" />
              </div>
              <div className="mt-1 text-xs text-muted">{p.desc}</div>
            </a>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted">说明：中国境内招投标暂无免费开放 API，此处直达官方权威平台。</div>
      </section>

      {/* World Bank international tenders (live) */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5"><Gavel className="h-4 w-4" /> 国际招标机会 · 世界银行采购（实时）</span>
        </SectionTitle>
        <Card>
          <div className="divide-y">
            {tenders.map((tn) => (
              <a key={tn.id} href={tn.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-4 py-3 transition hover:bg-background">
                <div className="min-w-0">
                  <div className="truncate text-sm">{tn.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <Badge tone="blue">{tn.type}</Badge>
                    {tn.country && <span>{tn.country}</span>}
                    {tn.noticeDate && <span>· 发布 {tn.noticeDate}</span>}
                    {tn.deadline && <span className="text-amber-600 dark:text-amber-400">· 截止 {tn.deadline}</span>}
                  </div>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted" />
              </a>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted">来源：World Bank Procurement Notices（全球世行融资项目招标，实时）</div>
        </Card>
      </section>
    </div>
  );
}
