"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";

const reportTypes = [
  "市场研究报告", "行业报告", "企业尽调", "供应链报告", "采购报告",
  "竞争分析", "SWOT", "投资分析", "市场进入战略", "风险分析", "政策分析",
];

export default function ReportsPage() {
  const t = useT();
  const [type, setType] = useState(reportTypes[0]);
  const [topic, setTopic] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.reports")} subtitle="一键生成咨询公司级排版的报告：目录、图表、引用来源，支持 PDF / Word / PowerPoint 导出与三种语言。" />

      <Card>
        <SectionTitle>报告类型</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((r) => (
            <button key={r} onClick={() => setType(r)} className={`rounded-full border px-3 py-1 text-xs transition ${type === r ? "border-accent bg-accent/10 text-accent" : "text-muted hover:text-foreground"}`}>{r}</button>
          ))}
        </div>
        <input
          value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="报告主题，例如：中国人形机器人市场 / 比亚迪企业尽调"
          className="mt-4 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="blue">{type}</Badge>
          <Badge>PDF</Badge><Badge>Word</Badge><Badge>PowerPoint</Badge>
        </div>
      </Card>

      <Card>
        <SectionTitle>AI 报告生成</SectionTitle>
        <AiPanel
          key={type + topic}
          mode="report"
          placeholder="补充报告要求或直接生成…"
          seedPrompt={`请生成一份「${type}」，主题：「${topic || "中国市场"}」。使用咨询公司标准结构：执行摘要、目录、市场概览、深入分析（含关键数据）、竞争格局、SWOT、风险、建议、结论，并在结尾列出数据来源。用 Markdown 标题。`}
          suggestions={["生成完整报告", "只要执行摘要", "补充图表建议", "列出数据来源"]}
        />
      </Card>
    </div>
  );
}
