"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { PolicyForm } from "./policy-form";
import { policyTemplates, type PolicyTemplate } from "../templates";

export function PolicyWizard() {
  // undefined = nothing chosen yet; null = blank form; object = prefilled template.
  const [choice, setChoice] = useState<PolicyTemplate | null | undefined>(undefined);

  if (choice === undefined) {
    return (
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">录入向导 · 从真实模板开始</h3>
        </div>
        <p className="mb-4 text-xs text-muted">
          选择一条真实、可核验的政策作为起点（会预填机构、生效日、三语标题与摘要），再按需修改后保存；或从空白开始。
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {policyTemplates.map((t) => (
            <button key={t.slug} onClick={() => setChoice(t)}
              className="rounded-lg border p-3 text-left transition hover:border-accent hover:bg-background">
              <div className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 shrink-0 text-muted" />{t.title.zh}</div>
              <div className="mt-1 text-xs text-muted">{t.org} · 生效 {t.effectiveDate}</div>
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
      <PolicyForm key={choice?.slug ?? "blank"} template={choice ?? undefined} />
    </div>
  );
}
