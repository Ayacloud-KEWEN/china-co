"use client";

import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, RiskBadge, Stat, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import type { Company } from "@/db/schema";

type Fin = NonNullable<Company["financials"]>;

function money(v: number | null, cur: string): string {
  if (v == null) return "—";
  const sym = cur === "HKD" ? "HK$" : cur === "USD" ? "$" : "¥";
  if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e8) return `${sym}${(v / 1e8).toFixed(1)}亿`;
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`;
  return `${sym}${v.toLocaleString()}`;
}
const pct = (v: number | null) => (v == null ? "—" : `${v >= 0 ? "" : ""}${v.toFixed(1)}%`);
const num = (v: number | null) => (v == null ? "—" : v.toFixed(2));

function FinancialsCard({ f }: { f: Fin }) {
  const rows: { label: string; value: string; up?: boolean }[] = [
    { label: "市值", value: money(f.marketCap, f.currency) },
    { label: "股价", value: money(f.price, f.currency), up: (f.changePct ?? 0) >= 0 },
    { label: "涨跌", value: pct(f.changePct), up: (f.changePct ?? 0) >= 0 },
    { label: "市盈率 P/E", value: num(f.pe) },
    { label: "市净率 P/B", value: num(f.pb) },
    { label: "每股收益 EPS", value: num(f.eps) },
    { label: "营业收入 (TTM)", value: money(f.revenue, f.currency) },
    { label: "营收增速", value: pct(f.revenueGrowth), up: (f.revenueGrowth ?? 0) >= 0 },
    { label: "毛利率", value: pct(f.grossMargin) },
    { label: "净利率", value: pct(f.profitMargin) },
    { label: "ROE", value: pct(f.roe) },
    { label: "52周区间", value: `${money(f.week52Low, f.currency)} – ${money(f.week52High, f.currency)}` },
  ];
  return (
    <Card>
      <SectionTitle action={<a href={`https://finance.yahoo.com/quote/${f.symbol}`} target="_blank" rel="noreferrer" className="text-xs text-accent">Yahoo Finance ↗</a>}>
        财务概览 · {f.symbol} · {f.exchange}
      </SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-xs text-muted">{r.label}</div>
            <div className={`text-sm font-semibold ${r.up === undefined ? "" : r.up ? "text-emerald-500" : "text-red-500"}`}>{r.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-muted">来源：Yahoo Finance · 截至 {f.asOf}（数据延迟，仅供参考，非投资建议）</div>
    </Card>
  );
}

export function CompanyView({ c }: { c: Company }) {
  const { lang } = useLang();
  const t = useT();

  const facts: [string, string][] = [
    ["行业", c.industry], ["总部", c.city], ["成立", String(c.founded)],
    ["员工", c.employees], ["营收", c.revenue], ["上市", c.listed],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="text-5xl">{c.logo}</div>
        <div className="flex-1">
          <PageHeader title={`${lang === "en" ? c.nameEn : c.name}`} subtitle={c.nameEn} />
        </div>
        <RiskBadge score={c.riskScore} />
      </div>

      <Card>
        <p className="text-sm leading-relaxed">{c.overview[lang]}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k}><div className="text-xs text-muted">{k}</div><div className="text-sm font-medium">{v}</div></div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="成长指数" value={`+${c.growth}%`} up />
        <Stat label="风险评分" value={String(c.riskScore)} />
        <Stat label="出口市场" value={String(c.exportMarkets.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>产品 / 品牌</SectionTitle>
          <div className="flex flex-wrap gap-2">{c.products.map((p) => <Badge key={p} tone="blue">{p}</Badge>)}</div>
        </Card>
        <Card>
          <SectionTitle>竞争对手</SectionTitle>
          <div className="flex flex-wrap gap-2">{c.competitors.map((p) => <Badge key={p} tone="amber">{p}</Badge>)}</div>
        </Card>
        <Card>
          <SectionTitle>出口市场</SectionTitle>
          <div className="flex flex-wrap gap-2">{c.exportMarkets.map((p) => <Badge key={p} tone="green">{p}</Badge>)}</div>
        </Card>
        <Card>
          <SectionTitle>{t("common.sources")}</SectionTitle>
          <ul className="space-y-1">
            {c.sources.map((s) => (
              <li key={s.name}><a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">{s.name}</a></li>
            ))}
          </ul>
        </Card>
      </div>

      {c.financials && <FinancialsCard f={c.financials} />}

      {c.patents && (
        <Card>
          <SectionTitle action={<a href={c.patents.searchUrl} target="_blank" rel="noreferrer" className="text-xs text-accent">在 Google Patents 查看</a>}>
            专利 / 知识产权 · Google Patents
          </SectionTitle>
          <div className="mb-3">
            <span className="text-2xl font-bold">{c.patents.total.toLocaleString()}</span>
            <span className="ml-2 text-sm text-muted">项专利（assignee: {c.patents.assignee}）</span>
          </div>
          <ul className="space-y-1.5">
            {c.patents.top.map((p) => (
              <li key={p.number}>
                <a href={p.url} target="_blank" rel="noreferrer" className="group flex gap-2 text-sm hover:text-accent">
                  <span className="shrink-0 font-mono text-xs text-muted">{p.number}</span>
                  <span className="truncate group-hover:underline">{p.title}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-[11px] text-muted">来源：Google Patents（patents.google.com）</div>
        </Card>
      )}

      <Card>
        <SectionTitle>AI 企业分析 · SWOT / 波特五力 / 风险</SectionTitle>
        <AiPanel
          mode="company"
          placeholder={`向 AI 提问关于 ${c.name} 的任何问题…`}
          seedPrompt={`请对「${c.name}（${c.nameEn}）」生成完整企业情报分析：概览、SWOT、波特五力、竞争格局、供应链位置、国际化能力、风险与 AI 建议。`}
          suggestions={[`${c.name} 的 SWOT`, `${c.name} 供应链风险`, `与竞争对手对比`, `国际化能力评估`]}
        />
      </Card>
    </div>
  );
}
