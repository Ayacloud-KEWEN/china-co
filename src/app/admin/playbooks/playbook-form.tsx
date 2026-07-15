"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Field, Area, Row, Select, I18nFields } from "../form-ui";
import { savePlaybook } from "@/app/actions/admin";
import type { Playbook } from "@/db/schema";

export function PlaybookForm({ playbook }: { playbook?: Playbook }) {
  const router = useRouter();
  const editing = !!playbook;
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; ok?: boolean } | null, fd: FormData) => {
      const res = await savePlaybook(playbook?.slug ?? null, prev, fd);
      if (res.ok) router.push("/admin/playbooks");
      return res;
    },
    null,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Row>
          <Field label="Slug（唯一标识）" name="slug" defaultValue={playbook?.slug} required placeholder="setup-wfoe" hint="小写字母、数字、连字符" />
          <Field label="分类" name="category" defaultValue={playbook?.category} placeholder="设立外资公司" />
        </Row>
        <Row>
          <Select label="难度" name="difficulty" options={["低", "中", "高"]} defaultValue={playbook?.difficulty} required />
          <Field label="预计时间" name="time" defaultValue={playbook?.time} placeholder="2–4 个月" />
        </Row>
        <Field label="预计成本" name="cost" defaultValue={playbook?.cost} placeholder="¥80k–200k" />
        <I18nFields label="标题" name="title" zh={playbook?.title?.zh} en={playbook?.title?.en} fr={playbook?.title?.fr} />
        <I18nFields label="概述（可选）" name="summary" zh={playbook?.summary?.zh} en={playbook?.summary?.en} fr={playbook?.summary?.fr} />

        <Area label="办理流程" name="steps" rows={6}
          defaultValue={playbook?.steps?.map((s) => `${s.title} | ${s.detail}`).join("\n")}
          hint="每行一步，格式：标题 | 说明" placeholder="公司名称预先核准 | 向市场监督管理局提交企业名称…" />
        <Area label="所需材料" name="documents" defaultValue={playbook?.documents?.join(", ")} hint="逗号或换行分隔" />
        <Area label="涉及部门 / 机构" name="departments" defaultValue={playbook?.departments?.join(", ")} hint="逗号或换行分隔" />
        <Area label="关键风险" name="risks" defaultValue={playbook?.risks?.join("\n")} hint="逗号或换行分隔" />
        <Area label="实用建议" name="tips" defaultValue={playbook?.tips?.join("\n")} hint="逗号或换行分隔" />
        <Area label="常见问题" name="faq" rows={4}
          defaultValue={playbook?.faq?.map((f) => `${f.q} | ${f.a}`).join("\n")}
          hint="每行一条，格式：问题 | 回答" placeholder="需要多少注册资本？ | 多数行业实行认缴制…" />
        <Row>
          <Area label="推荐城市" name="relatedCities" defaultValue={playbook?.relatedCities?.join(", ")} hint="逗号或换行分隔" placeholder="上海, 深圳" />
          <Field label="官方依据链接" name="sourceUrl" defaultValue={playbook?.sourceUrl} placeholder="https://www.mofcom.gov.cn" />
        </Row>

        {state?.error && <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-sm text-red-500">{state.error}</div>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "保存中…" : editing ? "保存修改" : "创建攻略"}
          </button>
          <button type="button" onClick={() => router.push("/admin/playbooks")} className="rounded-lg border px-4 py-2 text-sm hover:bg-background">取消</button>
        </div>
      </form>
    </Card>
  );
}
