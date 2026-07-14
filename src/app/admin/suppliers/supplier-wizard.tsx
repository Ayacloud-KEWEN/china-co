"use client";

import { useState } from "react";
import { Factory, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { SupplierForm } from "./supplier-form";
import { supplierTemplates, type SupplierTemplate } from "../templates";

export function SupplierWizard() {
  const [choice, setChoice] = useState<SupplierTemplate | null | undefined>(undefined);

  if (choice === undefined) {
    return (
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">录入向导 · 从真实供应商开始</h3>
        </div>
        <p className="mb-4 text-xs text-muted">
          选择一家真实的中国制造商作为起点（会预填名称、类别、城市、产品与常见认证），产能/风险评分等留空由你补充；或从空白开始。
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {supplierTemplates.map((t) => (
            <button key={t.slug} onClick={() => setChoice(t)}
              className="rounded-lg border p-3 text-left transition hover:border-accent hover:bg-background">
              <div className="flex items-center gap-2 text-sm font-medium"><Factory className="h-4 w-4 shrink-0 text-muted" />{t.name}</div>
              <div className="mt-1 text-xs text-muted">{t.category} · {t.city}</div>
            </button>
          ))}
        </div>
        <button onClick={() => setChoice(null)} className="mt-4 text-sm text-accent hover:underline">从空白开始 →</button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setChoice(undefined)} className="text-sm text-muted hover:text-accent">← 返回选择模板</button>
      <SupplierForm key={choice?.slug ?? "blank"} template={choice ?? undefined} />
    </div>
  );
}
