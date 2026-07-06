"use client";

import { useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, RiskBadge, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import type { Supplier } from "@/db/schema";

export function SupplyView({ suppliers }: { suppliers: Supplier[] }) {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.supply")} subtitle="中国供应链知识库：供应商、OEM/ODM、工厂、物流、港口、工业园、检测与认证机构。" />

      <Card>
        <SectionTitle>AI 供应商推荐 / RFQ / 采购策略</SectionTitle>
        <AiPanel
          mode="search"
          placeholder="描述你的采购需求，AI 推荐供应商并生成 RFQ…"
          suggestions={["寻找电池 PACK 供应商", "食品 OEM 工厂推荐", "生成 RFQ 模板", "供应链风险分析", "寻找备选供应商"]}
        />
      </Card>

      <SectionTitle>供应商目录</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        {suppliers.map((s) => (
          <Card key={s.slug}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted">{s.category} · {s.city}</div>
              </div>
              <RiskBadge score={s.riskScore} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted">产能：</span>{s.capacity}</div>
              <div><span className="text-muted">出口：</span>{s.exportMarkets.join(", ")}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.products.map((p) => <Badge key={p} tone="blue">{p}</Badge>)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.certs.map((c) => <Badge key={c} tone="green">{c}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
