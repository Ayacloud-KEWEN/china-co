"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, I18nFields } from "../form-ui";
import { saveCompany } from "@/app/actions/admin";
import type { Company } from "@/db/schema";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const editing = !!company;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await saveCompany(company?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/companies");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识，URL 用）" name="slug" defaultValue={company?.slug} required placeholder="byd" hint="小写字母、数字、连字符" />
          <Field label="Logo（emoji）" name="logo" defaultValue={company?.logo} placeholder="🔋" />
        </Row>
        <Row>
          <Field label="中文名称" name="name" defaultValue={company?.name} required placeholder="比亚迪" />
          <Field label="英文名称" name="nameEn" defaultValue={company?.nameEn} placeholder="BYD Company" />
        </Row>
        <Row>
          <Field label="行业" name="industry" defaultValue={company?.industry} placeholder="新能源汽车" />
          <Field label="城市" name="city" defaultValue={company?.city} placeholder="深圳" />
        </Row>
        <Row>
          <Field label="成立年份" name="founded" type="number" defaultValue={company?.founded} placeholder="1995" />
          <Field label="员工规模" name="employees" defaultValue={company?.employees} placeholder="700,000+" />
        </Row>
        <Row>
          <Field label="营收" name="revenue" defaultValue={company?.revenue} placeholder="¥602B (2023)" />
          <Field label="上市信息" name="listed" defaultValue={company?.listed} placeholder="SZSE: 002594" />
        </Row>
        <Row>
          <Field label="风险评分 (0-100)" name="riskScore" type="number" defaultValue={company?.riskScore ?? 30} />
          <Field label="增长率 (%)" name="growth" type="number" defaultValue={company?.growth ?? 0} />
        </Row>

        <Area label="标签" name="tags" defaultValue={company?.tags?.join(", ")} hint="逗号或换行分隔" placeholder="新能源, 电池, 汽车" />
        <Area label="出口市场" name="exportMarkets" defaultValue={company?.exportMarkets?.join(", ")} hint="逗号或换行分隔" placeholder="Europe, Southeast Asia" />
        <Area label="主要产品" name="products" defaultValue={company?.products?.join(", ")} hint="逗号或换行分隔" />
        <Area label="竞争对手" name="competitors" defaultValue={company?.competitors?.join(", ")} hint="逗号或换行分隔" />

        <I18nFields label="公司概述" name="overview" zh={company?.overview?.zh} en={company?.overview?.en} fr={company?.overview?.fr} />

        <Area label="高管团队" name="executives" rows={3}
          defaultValue={company?.executives?.map((e) => `${e.name} | ${e.role}`).join("\n")}
          hint="每行一位，格式：姓名 | 职务" placeholder="王传福 | 董事长兼总裁" />

        <Area label="来源引用" name="sources" rows={3}
          defaultValue={company?.sources?.map((s) => `${s.name} | ${s.url}`).join("\n")}
          hint="每行一条，格式：名称 | 网址" placeholder="BYD 2023 Annual Report | https://www.bydglobal.com" />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}

        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建企业"}
          </button>
          <button type="button" onClick={() => router.push("/admin/companies")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
        <p className="text-[11px] text-muted">专利、财务、股价、股权等增强字段由数据摄取（db:ingest）自动填充，此处不编辑。</p>
      </form>
    </Card>
  );
}
