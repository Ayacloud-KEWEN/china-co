"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { triggerReembed } from "@/app/actions/admin";

export function ReembedButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const res = await triggerReembed();
          setMsg(res.error ? { text: res.error } : { ok: true, text: "已触发向量索引重建，稍后完成。" });
        })}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} /> 重建向量索引
      </button>
      {msg && <span className={`text-sm ${msg.ok ? "text-emerald-500" : "text-red-500"}`}>{msg.text}</span>}
    </div>
  );
}
