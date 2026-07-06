"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Card } from "@/components/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="mb-1 text-2xl font-bold">登录 China MOS</h1>
      <p className="mb-6 text-sm text-muted">登录后可关注企业/行业、记笔记、保存 AI 分析并与团队共享。</p>
      <Card>
        <form action={action} className="space-y-4">
          <div>
            <label className="text-xs text-muted">邮箱</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">密码</label>
            <input name="password" type="password" required className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
          <button disabled={pending} className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "登录中…" : "登录"}
          </button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-muted">还没有账户？<Link href="/signup" className="text-accent hover:underline">注册</Link></p>
    </div>
  );
}
