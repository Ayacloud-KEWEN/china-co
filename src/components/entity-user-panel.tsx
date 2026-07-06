"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Star, StickyNote, Check, Loader2 } from "lucide-react";
import { toggleWatch, saveNote } from "@/app/actions/user-data";
import { Card } from "@/components/ui";

export function EntityUserPanel({
  entityType, entitySlug, label, loggedIn, initialWatching = false, initialNote = "",
}: {
  entityType: string; entitySlug: string; label: string;
  loggedIn: boolean; initialWatching?: boolean; initialNote?: string;
}) {
  const [watching, setWatching] = useState(initialWatching);
  const [note, setNote] = useState(initialNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  if (!loggedIn) {
    return (
      <Card className="flex items-center justify-between">
        <span className="text-sm text-muted">登录后可**关注**此{entityType === "company" ? "企业" : entityType === "industry" ? "行业" : "城市"}并添加**笔记**。</span>
        <Link href="/login" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white">登录</Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => start(async () => { const r = await toggleWatch(entityType, entitySlug, label); if ("watching" in r) setWatching(!!r.watching); })}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${watching ? "border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400" : "hover:bg-background"}`}
        >
          <Star className={`h-4 w-4 ${watching ? "fill-amber-400 text-amber-400" : ""}`} /> {watching ? "已关注" : "关注"}
        </button>
        <button onClick={() => setNoteOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-background">
          <StickyNote className="h-4 w-4" /> 笔记{note ? " ·已记" : ""}
        </button>
      </div>

      {noteOpen && (
        <div className="mt-3">
          <textarea
            value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }}
            placeholder="记录你对该主题的想法、待办、结论…（仅自己可见）"
            className="h-24 w-full rounded-lg border bg-surface p-3 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => start(async () => { await saveNote(entityType, entitySlug, note); setSaved(true); })}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} 保存笔记
            </button>
            {saved && <span className="text-xs text-emerald-500">已保存</span>}
          </div>
        </div>
      )}
    </Card>
  );
}
