"use client";

import { useLang } from "@/lib/i18n";
import { PageHeader, Card, Badge, Stat, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import { Copy, Share2, FileDown } from "lucide-react";
import type { Playbook } from "@/db/schema";

export function PlaybookView({ p }: { p: Playbook }) {
  const { lang } = useLang();
  const title = p.title[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="blue">{p.category}</Badge>
          <PageHeader title={title} />
        </div>
        <div className="flex gap-2">
          {([[Copy, "复制"], [Share2, "分享"], [FileDown, "PDF/Word"]] as const).map(([Icon, label]) => (
            <button key={label} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-background">
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="预计时间" value={p.time} />
        <Stat label="预计成本" value={p.cost} />
        <Stat label="难度" value={p.difficulty} />
      </div>

      <Card>
        <SectionTitle>AI 自动生成 Playbook</SectionTitle>
        <p className="mb-3 text-sm text-muted">
          点击生成，AI 将输出：目标、适用企业、准备工作、办理流程、预计时间与成本、涉及政府部门、关键风险、推荐合作伙伴/供应商/展会/城市/产业园、成功案例、行动清单与 AI 建议。
        </p>
        <AiPanel
          mode="playbook"
          seedPrompt={`请生成一份完整的中国市场 Playbook：「${title}」。严格包含以下小节：目标、适用企业、准备工作、办理流程、预计时间、预计成本、涉及政府部门、关键风险、推荐合作伙伴、推荐供应商、推荐展会、推荐城市、推荐产业园、成功案例、行动清单、AI 建议。用 Markdown 标题分节。`}
          suggestions={["生成行动清单", "涉及哪些政府部门", "关键风险有哪些", "推荐城市与产业园"]}
        />
      </Card>
    </div>
  );
}
