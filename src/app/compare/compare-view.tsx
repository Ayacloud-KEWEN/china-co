"use client";

import { useState } from "react";
import { useLang, useT } from "@/lib/i18n";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import type { Company, Industry } from "@/db/schema";

type Kind = "company" | "industry";

function money(v: number | null | undefined, cur = "CNY"): string {
  if (v == null) return "—";
  const sym = cur === "HKD" ? "HK$" : cur === "USD" ? "$" : "¥";
  if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e8) return `${sym}${(v / 1e8).toFixed(0)}亿`;
  return `${sym}${v.toLocaleString()}`;
}
const pct = (v: number | null | undefined) => (v == null ? "—" : `${v.toFixed(1)}%`);
const num = (v: number | null | undefined) => (v == null ? "—" : v.toFixed(2));

const companyRows: { label: string; get: (c: Company) => string }[] = [
  { label: "行业", get: (c) => c.industry },
  { label: "总部", get: (c) => c.city },
  { label: "成立", get: (c) => String(c.founded) },
  { label: "员工", get: (c) => c.employees },
  { label: "市值", get: (c) => money(c.financials?.marketCap, c.financials?.currency) },
  { label: "股价", get: (c) => money(c.financials?.price, c.financials?.currency) },
  { label: "市盈率 P/E", get: (c) => num(c.financials?.pe) },
  { label: "营收 (TTM)", get: (c) => money(c.financials?.revenue, c.financials?.currency) },
  { label: "营收增速", get: (c) => pct(c.financials?.revenueGrowth) },
  { label: "净利率", get: (c) => pct(c.financials?.profitMargin) },
  { label: "ROE", get: (c) => pct(c.financials?.roe) },
  { label: "专利数", get: (c) => (c.patents ? c.patents.total.toLocaleString() : "—") },
  { label: "风险评分", get: (c) => String(c.riskScore) },
  { label: "成长指数", get: (c) => `+${c.growth}%` },
];

const industryRows: { label: string; get: (i: Industry) => string }[] = [
  { label: "市场规模", get: (i) => i.marketSize },
  { label: "增长率", get: (i) => `+${i.growth}%` },
  { label: "龙头企业", get: (i) => i.leaders.slice(0, 3).join("、") },
  { label: "主要城市", get: (i) => i.cities.slice(0, 3).join("、") },
  { label: "中国出口额", get: (i) => (i.trade ? `$${(i.trade.exportUSD / 1e9).toFixed(1)}B` : "—") },
  { label: "研究论文", get: (i) => (i.research ? i.research.total.toLocaleString() : "—") },
];

export function CompareView({ companies, industries }: { companies: Company[]; industries: Industry[] }) {
  const t = useT();
  const { lang } = useLang();
  const [kind, setKind] = useState<Kind>("company");
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);

  const list = kind === "company" ? companies : industries;
  const nameOf = (x: Company | Industry) => (lang === "en" ? x.nameEn : x.name);
  const A = list[a], B = list[b];

  const seed = A && B
    ? `请并排对比${kind === "company" ? "两家中国企业" : "两个中国行业"}「${A.name}」与「${B.name}」：从关键指标、优劣势、竞争态势、增长前景等维度分析，并给出对欧洲企业的启示。用 Markdown 表格与要点。`
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.compare")} subtitle="并排对比两家企业或两个行业的结构化指标，并由 AI 生成对比点评。" />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border">
            {(["company", "industry"] as Kind[]).map((k) => (
              <button key={k} onClick={() => { setKind(k); setA(0); setB(1); }} className={`px-4 py-1.5 text-sm ${kind === k ? "bg-primary text-white" : "hover:bg-background"}`}>
                {k === "company" ? "企业" : "行业"}
              </button>
            ))}
          </div>
          <select value={a} onChange={(e) => setA(Number(e.target.value))} className="rounded-lg border bg-surface px-3 py-1.5 text-sm">
            {list.map((x, i) => <option key={i} value={i}>{nameOf(x)}</option>)}
          </select>
          <span className="text-muted">vs</span>
          <select value={b} onChange={(e) => setB(Number(e.target.value))} className="rounded-lg border bg-surface px-3 py-1.5 text-sm">
            {list.map((x, i) => <option key={i} value={i}>{nameOf(x)}</option>)}
          </select>
        </div>
      </Card>

      {A && B && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium text-muted">指标</th>
                  <th className="py-2 font-semibold">{nameOf(A)}</th>
                  <th className="py-2 font-semibold">{nameOf(B)}</th>
                </tr>
              </thead>
              <tbody>
                {kind === "company"
                  ? companyRows.map((r) => (
                    <tr key={r.label} className="border-b last:border-0">
                      <td className="py-2 text-muted">{r.label}</td>
                      <td className="py-2 pr-4">{r.get(A as Company)}</td>
                      <td className="py-2">{r.get(B as Company)}</td>
                    </tr>
                  ))
                  : industryRows.map((r) => (
                    <tr key={r.label} className="border-b last:border-0">
                      <td className="py-2 text-muted">{r.label}</td>
                      <td className="py-2 pr-4">{r.get(A as Industry)}</td>
                      <td className="py-2">{r.get(B as Industry)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle>AI 对比点评</SectionTitle>
        <AiPanel key={`${kind}-${a}-${b}`} mode="consultant" seedPrompt={seed} placeholder="就这两者的对比向 AI 追问…" />
      </Card>
    </div>
  );
}
