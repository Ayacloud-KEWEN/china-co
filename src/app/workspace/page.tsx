"use client";

import { useT } from "@/lib/i18n";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";

const clients = [
  { name: "Müller Robotics GmbH", country: "🇩🇪 德国", stage: "市场进入", owner: "李咨询" },
  { name: "Nordic Foods AB", country: "🇸🇪 瑞典", stage: "供应链搭建", owner: "王顾问" },
  { name: "Lumière Cosmétiques", country: "🇫🇷 法国", stage: "品牌落地", owner: "张顾问" },
];

const board: Record<string, { title: string; client: string }[]> = {
  待办: [
    { title: "深圳建厂选址分析", client: "Müller Robotics" },
    { title: "小红书投放方案", client: "Lumière" },
  ],
  进行中: [
    { title: "电池供应商尽调", client: "Nordic Foods" },
    { title: "WFOE 设立流程", client: "Müller Robotics" },
  ],
  评审中: [{ title: "市场进入战略报告 v2", client: "Müller Robotics" }],
  已完成: [{ title: "行业竞争分析", client: "Lumière" }],
};

export default function WorkspacePage() {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.workspace")} subtitle="AI 咨询工作空间：客户管理、项目协作、共享知识库/Playbook/Agent/报告、任务与审批流程、版本控制、客户门户。" />

      <div className="grid gap-4 lg:grid-cols-3">
        {clients.map((c) => (
          <Card key={c.name}>
            <div className="font-semibold">{c.name}</div>
            <div className="mt-1 text-xs text-muted">{c.country}</div>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="blue">{c.stage}</Badge>
              <span className="text-xs text-muted">负责人 {c.owner}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>项目看板</SectionTitle>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(board).map(([col, tasks]) => (
          <div key={col} className="rounded-xl border bg-background/50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{col}</span>
              <span className="text-xs text-muted">{tasks.length}</span>
            </div>
            <div className="space-y-2">
              {tasks.map((tk) => (
                <div key={tk.title} className="rounded-lg border bg-surface p-3">
                  <div className="text-sm">{tk.title}</div>
                  <div className="mt-1 text-xs text-muted">{tk.client}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
