"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, I18nFields } from "../form-ui";
import { saveDivision } from "@/app/actions/admin";
import type { Division } from "@/db/schema";

export function DivisionForm({ d }: { d: Division }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await saveDivision(d.code, prev, fd);
      if (res.ok) router.push("/admin/divisions");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="中文名称" name="name" defaultValue={d.name} required />
          <Field label="英文名称" name="nameEn" defaultValue={d.nameEn} placeholder="Nanshan District" />
        </Row>
        <Row>
          <Field label="GDP" name="gdp" defaultValue={d.gdp} placeholder="¥8,500亿" hint="无免费数据源，需人工填写" />
          <Field label="常住人口" name="pop" defaultValue={d.pop} placeholder="185万" hint="由 db:divisions:enrich 从 Wikidata 填充" />
        </Row>
        <Field label="面积" name="area" defaultValue={d.area} placeholder="186.58 km²" hint="由 db:divisions:enrich 从 Wikidata 填充" />
        <Area label="支柱产业" name="pillars" defaultValue={d.pillars.join(", ")} hint="逗号或换行分隔" placeholder="电子信息, 生物医药" />
        <I18nFields label="区域概述" name="summary" zh={d.summary?.zh} en={d.summary?.en} fr={d.summary?.fr} />
        <Area label="内部备注" name="notes" defaultValue={d.notes} rows={4} hint="仅在该区域页面展示的补充说明" />
        <Field label="关联城市 Slug（可选）" name="citySlug" defaultValue={d.citySlug ?? ""} placeholder="shenzhen"
          hint="填写后，前台点击该行政区将跳转到对应的城市情报详情页" />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : "保存修改"}
          </button>
          <button type="button" onClick={() => router.push("/admin/divisions")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
        <p className="text-[11px] text-muted">区划代码 {d.code} · 层级与上下级关系由国标数据维护，不可在此修改。</p>
      </form>
    </Card>
  );
}
