"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
import type { Division } from "@/db/schema";

type Row = Pick<Division, "code" | "parentCode" | "level" | "name" | "citySlug" | "gdp" | "pop" | "notes"> & {
  pillars: string[];
  hasSummary: boolean;
};

const LEVEL_LABEL: Record<string, string> = { province: "省", city: "市", district: "区县", town: "乡镇" };

const isFilled = (r: Row) => !!(r.gdp || r.pop || r.pillars.length || r.notes || r.hasSummary || r.citySlug);

export function DivisionBrowser({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [parent, setParent] = useState<string | null>(null);   // null = province level
  const [onlyFilled, setOnlyFilled] = useState(false);

  const byCode = useMemo(() => new Map(rows.map((r) => [r.code, r])), [rows]);

  // Drill-down listing, or a flat search across all levels when a query is typed.
  const listed = useMemo(() => {
    const term = q.trim();
    const base = term
      ? rows.filter((r) => r.name.includes(term) || r.code.startsWith(term)).slice(0, 200)
      : rows.filter((r) => r.parentCode === parent);
    return onlyFilled ? base.filter(isFilled) : base;
  }, [rows, q, parent, onlyFilled]);

  const crumbs = useMemo(() => {
    const out: Row[] = [];
    let cur = parent ? byCode.get(parent) : undefined;
    while (cur) {
      out.unshift(cur);
      cur = cur.parentCode ? byCode.get(cur.parentCode) : undefined;
    }
    return out;
  }, [parent, byCode]);

  const filledCount = useMemo(() => rows.filter(isFilled).length, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索名称或区划代码…"
            className="w-full rounded-lg border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent" />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={onlyFilled} onChange={(e) => setOnlyFilled(e.target.checked)} />
          只看已填写
        </label>
        <div className="text-sm text-muted">共 {rows.length} 个行政区 · 已填写 {filledCount}</div>
      </div>

      {!q.trim() && (
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <button type="button" onClick={() => setParent(null)} className="text-accent hover:underline">全国</button>
          {crumbs.map((c) => (
            <span key={c.code} className="flex items-center gap-1">
              <span className="text-muted">/</span>
              <button type="button" onClick={() => setParent(c.code)} className="text-accent hover:underline">{c.name}</button>
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">名称</th>
              <th className="px-4 py-2 font-medium">代码</th>
              <th className="px-4 py-2 font-medium">层级</th>
              <th className="hidden px-4 py-2 font-medium sm:table-cell">已填写内容</th>
              <th className="px-4 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {listed.map((r) => {
              const kids = rows.some((x) => x.parentCode === r.code);
              return (
                <tr key={r.code} className="border-t hover:bg-background/50">
                  <td className="px-4 py-2">
                    {kids && !q.trim() ? (
                      <button type="button" onClick={() => setParent(r.code)} className="hover:text-accent hover:underline">{r.name}</button>
                    ) : (
                      <span>{r.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{r.code}</td>
                  <td className="px-4 py-2 text-muted">{LEVEL_LABEL[r.level] ?? r.level}</td>
                  <td className="hidden px-4 py-2 text-xs text-muted sm:table-cell">
                    {isFilled(r)
                      ? [r.gdp && "GDP", r.pop && "人口", r.pillars.length > 0 && "产业", r.hasSummary && "概述", r.notes && "备注", r.citySlug && `→ ${r.citySlug}`].filter(Boolean).join(" · ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end">
                      <Link href={`/admin/divisions/${r.code}`} className="rounded p-1.5 text-muted hover:bg-background hover:text-accent" title="编辑">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {listed.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">没有匹配的行政区。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
