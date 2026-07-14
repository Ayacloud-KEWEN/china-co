"use client";

import { useState, useTransition } from "react";
import { Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { CityForm } from "./city-form";
import { lookupCity } from "@/app/actions/admin";
import type { City } from "@/db/schema";

const quickPicks = ["北京", "广州", "成都", "重庆", "武汉", "西安", "南京", "青岛"];

export function CityWizard() {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // undefined = still choosing; null = blank form; object = prefilled from Wikidata.
  const [prefill, setPrefill] = useState<Partial<City> | null | undefined>(undefined);

  const run = (q: string) => {
    if (!q.trim()) return;
    setError(null);
    start(async () => {
      const res = await lookupCity(q);
      if (res.error || !res.data) { setError(res.error ?? "查询失败"); return; }
      setPrefill(res.data);
    });
  };

  if (prefill === undefined) {
    return (
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">录入向导 · 按城市名从 Wikidata 预填</h3>
        </div>
        <p className="mb-3 text-xs text-muted">
          输入城市名（中/英均可），自动预填中英文名、真实人口与 GDP（Wikidata 缺失则留空）。支柱产业、代表企业等需你补充。
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") run(name); }}
              placeholder="如：成都 / Chengdu"
              className="w-full rounded-lg border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <button disabled={pending} onClick={() => run(name)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "查询中…" : "查询"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickPicks.map((c) => (
            <button key={c} disabled={pending} onClick={() => { setName(c); run(c); }}
              className="rounded-full border px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-foreground disabled:opacity-50">{c}</button>
          ))}
        </div>
        {error && <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{error}</div>}
        <button onClick={() => setPrefill(null)} className="mt-4 text-sm text-accent hover:underline">从空白开始 →</button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={() => { setPrefill(undefined); setError(null); }} className="text-sm text-muted hover:text-accent">← 返回搜索</button>
      <CityForm key={prefill?.slug ?? "blank"} template={prefill ?? undefined} />
    </div>
  );
}
