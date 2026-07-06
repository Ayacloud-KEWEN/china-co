"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { Card } from "@/components/ui";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, null);
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="mb-1 text-2xl font-bold">注册 China MOS</h1>
      <p className="mb-6 text-sm text-muted">创建账户会同时创建一个团队（组织），你是拥有者，可邀请成员共享分析。</p>
      <Card>
        <form action={action} className="space-y-4">
          <div>
            <label className="text-xs text-muted">姓名</label>
            <input name="name" required className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">团队 / 公司名称</label>
            <input name="org" placeholder="可选" className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">邮箱</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">密码（至少 6 位）</label>
            <input name="password" type="password" required minLength={6} className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
          <button disabled={pending} className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "注册中…" : "注册"}
          </button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-muted">已有账户？<Link href="/login" className="text-accent hover:underline">登录</Link></p>
    </div>
  );
}
