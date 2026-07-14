"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

type Row = { slug: string; name: string; nameEn: string; industry: string; city: string; logo: string };

export function AdminList({ title, rows, basePath, onDelete }: {
  title: string;
  rows: Row[];
  basePath: string;
  onDelete: (slug: string) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = rows.filter((r) =>
    [r.name, r.nameEn, r.slug, r.industry, r.city].filter(Boolean).some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`搜索${title}…`}
            className="w-full rounded-lg border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent" />
        </div>
        <Link href={`${basePath}/new`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> 新增
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">名称</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="hidden px-4 py-2 font-medium sm:table-cell">行业/属性</th>
              <th className="hidden px-4 py-2 font-medium sm:table-cell">城市</th>
              <th className="px-4 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.slug} className="border-t hover:bg-background/50">
                <td className="px-4 py-2">
                  <span className="mr-1.5">{r.logo}</span>{r.name}
                  {r.nameEn && <span className="ml-1.5 text-xs text-muted">{r.nameEn}</span>}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-muted">{r.slug}</td>
                <td className="hidden px-4 py-2 text-muted sm:table-cell">{r.industry}</td>
                <td className="hidden px-4 py-2 text-muted sm:table-cell">{r.city}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-1">
                    <Link href={`${basePath}/${r.slug}`} className="rounded p-1.5 text-muted hover:bg-background hover:text-accent" title="编辑"><Pencil className="h-4 w-4" /></Link>
                    <button
                      disabled={pending && busy === r.slug}
                      onClick={() => {
                        if (!confirm(`确定删除「${r.name}」？此操作不可撤销。`)) return;
                        setBusy(r.slug);
                        start(async () => { await onDelete(r.slug); setBusy(null); });
                      }}
                      className="rounded p-1.5 text-muted hover:bg-background hover:text-red-500 disabled:opacity-50" title="删除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">没有匹配的{title}。</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">共 {rows.length} 条{q && ` · 匹配 ${filtered.length} 条`}</p>
    </div>
  );
}
