"use client";

import { useT } from "@/lib/i18n";
import { AiPanel } from "@/components/ai-panel";
import { PageHeader, Card } from "@/components/ui";
import { dataSources } from "@/lib/data";

export default function SearchPage() {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.search")} subtitle="输入任何商业问题，AI 自动识别意图、调用多数据源并生成结构化分析。" />
      <AiPanel
        mode="search"
        suggestions={[
          "分析中国 AI 市场", "新能源汽车竞争格局", "上海 vs 深圳 建厂对比",
          "医疗器械进口流程", "如何找代理商", "寻找电池供应商", "比较华为和中兴",
        ]}
      />
      <Card>
        <div className="mb-2 text-sm font-semibold text-muted">{t("common.sources")}</div>
        <div className="flex flex-wrap gap-2">
          {dataSources.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 text-xs text-muted hover:border-accent hover:text-foreground">
              {s.name}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
