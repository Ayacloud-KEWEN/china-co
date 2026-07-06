"use client";

import { useT } from "@/lib/i18n";
import { PageHeader, Card } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";

export default function ConsultantPage() {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.consultant")} subtitle="麦肯锡级别的中国市场进入战略顾问。提出你的目标，AI 自动生成完整咨询方案。" />
      <Card>
        <AiPanel
          mode="consultant"
          placeholder="例如：我是一家德国工业机器人公司，想进入中国，应该怎么做？"
          suggestions={[
            "我想进入中国，应该从哪里开始？",
            "我应该在哪里建厂？",
            "制定市场进入战略",
            "制定采购战略",
            "制定营销方案",
            "帮我寻找合作伙伴",
          ]}
        />
      </Card>
    </div>
  );
}
