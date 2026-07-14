"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, I18nFields } from "../form-ui";
import { saveCity } from "@/app/actions/admin";
import type { City } from "@/db/schema";

export function CityForm({ city }: { city?: City }) {
  const router = useRouter();
  const editing = !!city;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await saveCity(city?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/cities");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识）" name="slug" defaultValue={city?.slug} required placeholder="shenzhen" hint="小写字母、数字、连字符" />
          <Field label="英文名称" name="nameEn" defaultValue={city?.nameEn} placeholder="Shenzhen" />
        </Row>
        <Row>
          <Field label="中文名称" name="name" defaultValue={city?.name} required placeholder="深圳" />
          <div />
        </Row>
        <Row>
          <Field label="GDP" name="gdp" defaultValue={city?.gdp} placeholder="¥3.46T" />
          <Field label="人口" name="pop" defaultValue={city?.pop} placeholder="17.7M" />
        </Row>
        <Row>
          <Field label="甲级写字楼租金" name="officeRent" defaultValue={city?.officeRent} placeholder="¥180/㎡/月" />
          <Field label="平均月薪" name="avgWage" defaultValue={city?.avgWage} placeholder="¥13,500" />
        </Row>
        <Field label="外商直接投资 (FDI)" name="fdi" defaultValue={city?.fdi} placeholder="$110亿 (2023)" />
        <Area label="支柱产业" name="pillars" defaultValue={city?.pillars?.join(", ")} hint="逗号或换行分隔" placeholder="电子信息, 新能源, 生物医药" />
        <Area label="代表企业" name="leaders" defaultValue={city?.leaders?.join(", ")} hint="逗号或换行分隔" placeholder="华为, 比亚迪, 腾讯" />
        <I18nFields label="城市概述" name="summary" zh={city?.summary?.zh} en={city?.summary?.en} fr={city?.summary?.fr} />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建城市"}
          </button>
          <button type="button" onClick={() => router.push("/admin/cities")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
        <p className="text-[11px] text-muted">经纬度、地图 POI 等增强字段由数据摄取自动填充，此处不编辑。</p>
      </form>
    </Card>
  );
}
