"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row } from "../form-ui";
import { saveSupplier } from "@/app/actions/admin";
import type { Supplier } from "@/db/schema";

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const router = useRouter();
  const editing = !!supplier;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await saveSupplier(supplier?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/suppliers");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识）" name="slug" defaultValue={supplier?.slug} required placeholder="acme-parts" hint="小写字母、数字、连字符" />
          <Field label="名称" name="name" defaultValue={supplier?.name} required placeholder="宁波精工零部件" />
        </Row>
        <Row>
          <Field label="类别" name="category" defaultValue={supplier?.category} placeholder="汽车零部件" />
          <Field label="城市" name="city" defaultValue={supplier?.city} placeholder="宁波" />
        </Row>
        <Row>
          <Field label="产能" name="capacity" defaultValue={supplier?.capacity} placeholder="500万件/年" />
          <Field label="风险评分 (0-100)" name="riskScore" type="number" defaultValue={supplier?.riskScore ?? 30} />
        </Row>
        <Area label="产品" name="products" defaultValue={supplier?.products?.join(", ")} hint="逗号或换行分隔" placeholder="精密齿轮, 传动轴" />
        <Area label="认证" name="certs" defaultValue={supplier?.certs?.join(", ")} hint="逗号或换行分隔" placeholder="ISO 9001, IATF 16949" />
        <Area label="出口市场" name="exportMarkets" defaultValue={supplier?.exportMarkets?.join(", ")} hint="逗号或换行分隔" placeholder="Europe, North America" />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建供应商"}
          </button>
          <button type="button" onClick={() => router.push("/admin/suppliers")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
      </form>
    </Card>
  );
}
