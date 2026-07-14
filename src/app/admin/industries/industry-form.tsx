"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, I18nFields } from "../form-ui";
import { saveIndustry } from "@/app/actions/admin";
import type { Industry } from "@/db/schema";

export function IndustryForm({ industry }: { industry?: Industry }) {
  const router = useRouter();
  const editing = !!industry;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await saveIndustry(industry?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/industries");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识）" name="slug" defaultValue={industry?.slug} required placeholder="nev" hint="小写字母、数字、连字符" />
          <Field label="图标（emoji）" name="icon" defaultValue={industry?.icon} placeholder="🚗" />
        </Row>
        <Row>
          <Field label="中文名称" name="name" defaultValue={industry?.name} required placeholder="新能源汽车" />
          <Field label="英文名称" name="nameEn" defaultValue={industry?.nameEn} placeholder="New Energy Vehicles" />
        </Row>
        <Row>
          <Field label="市场规模" name="marketSize" defaultValue={industry?.marketSize} placeholder="¥1.2T" />
          <Field label="增长率 (%)" name="growth" type="number" defaultValue={industry?.growth ?? 0} />
        </Row>
        <Area label="龙头企业" name="leaders" defaultValue={industry?.leaders?.join(", ")} hint="逗号或换行分隔" placeholder="比亚迪, 特斯拉中国" />
        <Area label="核心城市" name="cities" defaultValue={industry?.cities?.join(", ")} hint="逗号或换行分隔" placeholder="深圳, 上海, 合肥" />
        <I18nFields label="行业概述" name="summary" zh={industry?.summary?.zh} en={industry?.summary?.en} fr={industry?.summary?.fr} />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建行业"}
          </button>
          <button type="button" onClick={() => router.push("/admin/industries")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
        <p className="text-[11px] text-muted">研究趋势、贸易流等增强字段由数据摄取自动填充，此处不编辑。</p>
      </form>
    </Card>
  );
}
