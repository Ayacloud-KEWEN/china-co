"use client";

import { useLang } from "@/lib/i18n";
import { PageHeader, Card, Badge, Stat, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import { FileText, Building2, AlertTriangle, Lightbulb, MapPin, ExternalLink } from "lucide-react";
import type { Playbook } from "@/db/schema";

const diffTone: Record<string, "green" | "amber" | "red"> = { 低: "green", 中: "amber", 高: "red" };

export function PlaybookView({ p }: { p: Playbook }) {
  const { lang } = useLang();
  const title = p.title[lang];
  const summary = p.summary?.[lang];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{p.category}</Badge>
          <Badge tone={diffTone[p.difficulty]}>{p.difficulty}难度</Badge>
        </div>
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="预计时间" value={p.time} />
        <Stat label="预计成本" value={p.cost} />
        <Stat label="难度" value={`${p.difficulty}难度`} />
      </div>

      {/* Step-by-step process */}
      {p.steps && p.steps.length > 0 && (
        <Card>
          <SectionTitle>办理流程 · {p.steps.length} 步</SectionTitle>
          <ol className="space-y-4">
            {p.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{i + 1}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.title}</div>
                  {s.detail && <div className="mt-0.5 text-sm text-muted">{s.detail}</div>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Required documents */}
        {p.documents && p.documents.length > 0 && (
          <Card>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4" /> 所需材料</span></SectionTitle>
            <ul className="space-y-1.5">
              {p.documents.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{d}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Departments */}
        {p.departments && p.departments.length > 0 && (
          <Card>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" /> 涉及部门 / 机构</span></SectionTitle>
            <div className="flex flex-wrap gap-2">
              {p.departments.map((d) => <Badge key={d} tone="blue">{d}</Badge>)}
            </div>
          </Card>
        )}

        {/* Risks */}
        {p.risks && p.risks.length > 0 && (
          <Card>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-500" /> 关键风险</span></SectionTitle>
            <ul className="space-y-1.5">
              {p.risks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{r}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Tips */}
        {p.tips && p.tips.length > 0 && (
          <Card>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-emerald-500" /> 实用建议</span></SectionTitle>
            <ul className="space-y-1.5">
              {p.tips.map((tp) => (
                <li key={tp} className="flex items-start gap-2 text-sm"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{tp}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* FAQ */}
      {p.faq && p.faq.length > 0 && (
        <Card>
          <SectionTitle>常见问题</SectionTitle>
          <div className="divide-y">
            {p.faq.map((f) => (
              <div key={f.q} className="py-3 first:pt-0 last:pb-0">
                <div className="text-sm font-medium">Q：{f.q}</div>
                <div className="mt-1 text-sm text-muted">A：{f.a}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Related cities + source */}
      {((p.relatedCities && p.relatedCities.length > 0) || p.sourceUrl) && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {p.relatedCities && p.relatedCities.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4" /> 推荐城市</span>
                {p.relatedCities.map((c) => <Badge key={c} tone="green">{c}</Badge>)}
              </div>
            ) : <span />}
            {p.sourceUrl && (
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                官方依据 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle>AI 深化 · 按你的行业与情况定制</SectionTitle>
        <p className="mb-3 text-sm text-muted">以上为通用流程。点击让 AI 结合你的产品/行业/目标城市，输出定制化的时间表、成本明细与行动清单。</p>
        <AiPanel
          mode="playbook"
          seedPrompt={`基于以下攻略「${title}」，结合我的具体情况给出定制化建议（可细化流程、时间表、成本明细、涉及部门、风险与行动清单）。请用 Markdown 分节。`}
          suggestions={["生成行动清单", "细化时间表", "成本明细估算", "结合我的行业定制"]}
        />
      </Card>
    </div>
  );
}
