"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import { deleteAnalysis, toggleShareAnalysis, removeWatch } from "@/app/actions/user-data";
import { addSubscription, removeSubscription } from "@/app/actions/notifications";
import { Star, Trash2, Share2, Users, Bell, Plus } from "lucide-react";
import type { Watchlist, Note, SavedAnalysis, Subscription } from "@/db/schema";

const typePath: Record<string, string> = { company: "/companies", industry: "/industries", city: "/cities" };
const typeLabel: Record<string, string> = { company: "企业", industry: "行业", city: "城市" };

export function MeView({ user, orgName, watchlist, notes, analyses, members, subscriptions }: {
  user: { id: number; name: string; email: string; role: string };
  orgName: string;
  watchlist: Watchlist[]; notes: Note[]; analyses: SavedAnalysis[];
  members: { id: number; name: string; email: string; role: string }[];
  subscriptions: Subscription[];
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [kw, setKw] = useState("");
  const [pending, start] = useTransition();

  const add = () => {
    const v = kw.trim();
    if (!v) return;
    start(async () => { await addSubscription(v); setKw(""); });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`${user.name} 的空间`} subtitle={`团队：${orgName} · 角色：${user.role === "owner" ? "拥有者" : "成员"}`} />

      {/* Policy subscriptions */}
      <Card>
        <SectionTitle>政策订阅 · {subscriptions.length}</SectionTitle>
        <p className="mb-3 text-sm text-muted">订阅关键词，管理员发布匹配的新政策时，你会在右上角铃铛收到站内通知。</p>
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Bell className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="如：数据出境、新能源补贴、外资"
              className="w-full rounded-lg border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent" />
          </div>
          <button disabled={pending} onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> 订阅
          </button>
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted">还没有订阅关键词。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subscriptions.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-sm">
                <Bell className="h-3.5 w-3.5 text-accent" />
                {s.keyword}
                <button onClick={() => removeSubscription(s.id)} className="text-muted hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Watchlist */}
      <Card>
        <SectionTitle>关注列表 · {watchlist.length}</SectionTitle>
        {watchlist.length === 0 ? (
          <p className="text-sm text-muted">还没有关注任何企业/行业/城市。到详情页点击「关注」即可加入。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {watchlist.map((w) => (
              <span key={w.id} className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Link href={`${typePath[w.entityType]}/${w.entitySlug}`} className="hover:text-accent">{w.label}</Link>
                <span className="text-[10px] text-muted">{typeLabel[w.entityType]}</span>
                <button onClick={() => removeWatch(w.id)} className="text-muted hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <SectionTitle>我的笔记 · {notes.length}</SectionTitle>
        {notes.length === 0 ? (
          <p className="text-sm text-muted">还没有笔记。到企业/行业/城市详情页可写笔记。</p>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                  <Badge tone="blue">{typeLabel[n.entityType]}</Badge>
                  <Link href={`${typePath[n.entityType]}/${n.entitySlug}`} className="hover:text-accent">{n.entitySlug}</Link>
                  <span>· {new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm">{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Saved analyses */}
      <Card>
        <SectionTitle>保存的分析 · {analyses.length}<span className="ml-2 text-xs font-normal text-muted">（含团队共享）</span></SectionTitle>
        {analyses.length === 0 ? (
          <p className="text-sm text-muted">还没有保存的 AI 分析。在 AI 回答下点击「保存分析」即可。</p>
        ) : (
          <div className="space-y-2">
            {analyses.map((a) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setOpenId(openId === a.id ? null : a.id)} className="text-left">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Badge>{a.mode}</Badge>
                      <span>{a.authorName}</span>
                      <span>· {new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.shared && <Badge tone="green"><Users className="mr-1 inline h-3 w-3" />团队共享</Badge>}
                      {a.userId !== user.id && <Badge tone="amber">同事的</Badge>}
                    </div>
                  </button>
                  {a.userId === user.id && (
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => toggleShareAnalysis(a.id)} title={a.shared ? "取消共享" : "共享给团队"} className={`rounded p-1.5 hover:bg-background ${a.shared ? "text-emerald-500" : "text-muted"}`}><Share2 className="h-4 w-4" /></button>
                      <button onClick={() => deleteAnalysis(a.id)} title="删除" className="rounded p-1.5 text-muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
                {openId === a.id && <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap border-t pt-3 text-sm">{a.content}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Team */}
      <Card>
        <SectionTitle>团队成员 · {members.length}</SectionTitle>
        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
              <span>{m.name} <span className="text-xs text-muted">{m.email}</span></span>
              <Badge tone={m.role === "owner" ? "blue" : "default"}>{m.role === "owner" ? "拥有者" : "成员"}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">同一团队的成员可看到彼此「共享」的分析。邀请成员功能即将上线。</p>
      </Card>
    </div>
  );
}
