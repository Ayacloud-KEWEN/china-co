"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, Select, I18nFields } from "../form-ui";
import { savePolicy } from "@/app/actions/admin";
import type { Policy } from "@/db/schema";
import type { PolicyTemplate } from "../templates";

// `policy` = editing an existing row (drives update identity). `template` = prefill
// values for a brand-new entry (create semantics preserved: prevSlug stays null).
export function PolicyForm({ policy, template }: { policy?: Policy; template?: PolicyTemplate }) {
  const router = useRouter();
  const editing = !!policy;
  const d = policy ?? template;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await savePolicy(policy?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/policies");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识）" name="slug" defaultValue={d?.slug} required placeholder="nev-subsidy-2025" hint="小写字母、数字、连字符" />
          <Select label="影响等级" name="impact" options={["高", "中", "低"]} defaultValue={d?.impact} required />
        </Row>
        <Row>
          <Field label="发布机构" name="org" defaultValue={d?.org} placeholder="工信部" />
          <Field label="发布日期" name="date" defaultValue={d?.date} placeholder="2025-03-15" />
        </Row>
        <Row>
          <Field label="适用范围" name="region" defaultValue={d?.region} placeholder="全国 / 广东省 / 深圳市" />
          <Field label="生效日期" name="effectiveDate" defaultValue={d?.effectiveDate} placeholder="2025-04-01" />
        </Row>
        <Field label="原文链接" name="sourceUrl" defaultValue={d?.sourceUrl} placeholder="https://www.gov.cn/…" />
        <I18nFields label="政策标题" name="title" zh={d?.title?.zh} en={d?.title?.en} fr={d?.title?.fr} />
        <I18nFields label="政策摘要（可选）" name="summary" zh={d?.summary?.zh} en={d?.summary?.en} fr={d?.summary?.fr} />
        <Area label="标签" name="tags" defaultValue={d?.tags?.join(", ")} hint="逗号或换行分隔" placeholder="新能源, 补贴, 出口" />

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建政策"}
          </button>
          <button type="button" onClick={() => router.push("/admin/policies")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
      </form>
    </Card>
  );
}
