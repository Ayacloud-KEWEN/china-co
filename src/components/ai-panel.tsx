"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Send, Sparkles, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useLang, useT } from "@/lib/i18n";

type Mode = "search" | "consultant" | "report" | "company" | "playbook";

type RagSource = { n: number; kind: string; title: string; url: string };

function Sources({ sources }: { sources: RagSource[] }) {
  if (!sources.length) return null;
  return (
    <div className="mb-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-accent">
        <Database className="h-3.5 w-3.5" /> 检索到 {sources.length} 条平台数据（RAG · 已注入 AI 上下文）
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s) => (
          <Link key={s.n} href={s.url} className="inline-flex items-center gap-1 rounded-full border bg-surface px-2.5 py-0.5 text-xs text-muted transition hover:border-accent hover:text-foreground">
            <span className="font-mono text-[10px] text-accent">[{s.n}]</span>
            <span className="text-[10px] opacity-70">{s.kind}</span>
            {s.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Renders text parts of assistant/user messages with light markdown.
function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#+\s/, "");
      const size = level === 1 ? "text-lg" : level === 2 ? "text-base" : "text-sm";
      return <div key={i} className={`mt-3 font-semibold ${size}`}>{content}</div>;
    }
    if (/^[-*]\s/.test(line)) return <li key={i} className="ml-5 list-disc">{line.replace(/^[-*]\s/, "")}</li>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    const bolded = line.replace(/\*\*(.+?)\*\*/g, "‹b›$1‹/b›");
    return (
      <p key={i} className="leading-relaxed">
        {bolded.split(/‹b›|‹\/b›/).map((seg, j) => (j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg))}
      </p>
    );
  });
}

export function AiPanel({
  mode = "search",
  placeholder,
  suggestions = [],
  seedPrompt,
  compact = false,
}: {
  mode?: Mode;
  placeholder?: string;
  suggestions?: string[];
  seedPrompt?: string;
  compact?: boolean;
}) {
  const { lang } = useLang();
  const t = useT();
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { mode, lang } }),
  });

  const busy = status === "streaming" || status === "submitted";

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="flex items-center gap-2 rounded-xl border bg-surface p-2 shadow-sm focus-within:border-accent"
      >
        <Sparkles className="ml-2 h-5 w-5 shrink-0 text-accent" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? t("search.placeholder")}
          className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("search.ask")}
        </button>
      </form>

      {suggestions.length > 0 && messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full border bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {seedPrompt && messages.length === 0 && !compact && (
        <button
          onClick={() => submit(seedPrompt)}
          className="self-start rounded-lg border border-accent bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/10"
        >
          <Sparkles className="mr-1.5 inline h-4 w-4" /> {t("common.aiSummary")}
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
          {error.message?.includes("DEEPSEEK") ? "DEEPSEEK_API_KEY 未配置。请复制 .env.local.example 为 .env.local 并填入密钥。" : `错误：${error.message}`}
        </div>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-xl border p-4 text-sm ${m.role === "user" ? "bg-background" : "bg-surface"}`}
        >
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {m.role === "user" ? "You" : "China MOS AI"}
          </div>
          {(() => {
            const src = m.parts.find((p) => p.type === "data-sources") as { data?: RagSource[] } | undefined;
            return src?.data ? <Sources sources={src.data} /> : null;
          })()}
          <div className="space-y-1">
            {m.parts.map((p, i) => (p.type === "text" ? <div key={i}>{renderText(p.text)}</div> : null))}
          </div>
        </div>
      ))}

      {busy && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("search.thinking")}
        </div>
      )}
    </div>
  );
}
