"use client";

import { useLang } from "@/lib/i18n";
import { PageHeader, Card, Badge, Stat, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import { BarChart } from "@/components/charts";
import type { Industry } from "@/db/schema";

function formatUSD(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function ResearchTrend({ research }: { research: NonNullable<Industry["research"]> }) {
  const max = Math.max(...research.series.map((s) => s.count), 1);
  return (
    <Card>
      <SectionTitle>研究趋势 · OpenAlex（论文年发表量）</SectionTitle>
      <div className="mb-2 text-sm text-muted">
        主题「{research.query}」共 <span className="font-semibold text-foreground">{research.total.toLocaleString()}</span> 篇论文
      </div>
      <div className="flex h-32 items-end gap-2">
        {research.series.map((s) => (
          <div key={s.year} className="flex flex-1 flex-col items-center gap-1">
            <div className="text-[10px] text-muted">{s.count.toLocaleString()}</div>
            <div className="w-full rounded-t bg-accent/70" style={{ height: `${(s.count / max) * 100}%` }} title={`${s.year}: ${s.count}`} />
            <div className="text-[10px] text-muted">{s.year}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-muted">来源：OpenAlex（api.openalex.org）</div>
    </Card>
  );
}

function TradeCard({ trade }: { trade: NonNullable<Industry["trade"]> }) {
  const max = Math.max(...trade.topPartners.map((p) => p.valueUSD), 1);
  return (
    <Card>
      <SectionTitle>对外贸易 · UN Comtrade（中国出口，{trade.year}）</SectionTitle>
      <div className="mb-3">
        <div className="text-xs text-muted">{trade.hs} · 出口至全球</div>
        <div className="text-2xl font-bold">{formatUSD(trade.exportUSD)}</div>
      </div>
      {trade.history && trade.history.length > 1 && (
        <div className="mb-3">
          <div className="mb-1 text-xs font-medium text-muted">中国出口额 · 逐年（十亿美元）</div>
          <BarChart data={trade.history.map((h) => ({ label: String(h.year), value: h.exportUSD / 1e9 }))} height={150} fmt={(v) => `${v.toFixed(0)}`} />
        </div>
      )}
      {trade.topPartners.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted">主要出口市场</div>
          {trade.topPartners.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-28 shrink-0 truncate text-xs">{p.name}</div>
              <div className="h-2 flex-1 rounded-full bg-background">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(p.valueUSD / max) * 100}%` }} />
              </div>
              <div className="w-16 shrink-0 text-right text-xs text-muted">{formatUSD(p.valueUSD)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 text-[11px] text-muted">来源：UN Comtrade（comtradeapi.un.org）</div>
    </Card>
  );
}

export function IndustryView({ ind }: { ind: Industry }) {
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <PageHeader title={`${ind.icon} ${lang === "en" ? ind.nameEn : ind.name}`} subtitle={ind.summary[lang]} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="市场规模" value={ind.marketSize} />
        <Stat label="增长率" value={`+${ind.growth}%`} up />
        <Stat label="主要城市" value={String(ind.cities.length)} />
      </div>

      {(ind.research || ind.trade) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {ind.research && <ResearchTrend research={ind.research} />}
          {ind.trade && <TradeCard trade={ind.trade} />}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><SectionTitle>龙头企业</SectionTitle><div className="flex flex-wrap gap-2">{ind.leaders.map((l) => <Badge key={l} tone="blue">{l}</Badge>)}</div></Card>
        <Card><SectionTitle>主要城市 / 产业集群</SectionTitle><div className="flex flex-wrap gap-2">{ind.cities.map((c) => <Badge key={c} tone="green">{c}</Badge>)}</div></Card>
      </div>
      <Card>
        <SectionTitle>AI 行业分析 · 竞争格局 / 技术趋势 / 预测</SectionTitle>
        <AiPanel
          mode="search"
          seedPrompt={`请对中国「${ind.name}」行业生成完整分析：市场规模、增长率、竞争格局、产业链、龙头企业、技术趋势、消费者趋势、政策、AI 预测与投资建议，并标注来源。`}
          suggestions={[`${ind.name} 产业链地图`, `技术趋势`, `投资机会`, `进入壁垒`]}
        />
      </Card>
    </div>
  );
}
