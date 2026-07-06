import { deepseek } from "@ai-sdk/deepseek";
import {
  streamText, convertToModelMessages, createUIMessageStream,
  createUIMessageStreamResponse, type UIMessage,
} from "ai";
import { retrieve } from "@/lib/rag/retrieve";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANG_INSTRUCTION: Record<string, string> = {
  zh: "请用简体中文回答。",
  en: "Answer in English.",
  fr: "Répondez en français.",
};

const MODE_PROMPT: Record<string, string> = {
  search:
    "你是 China MOS 的 AI 全局搜索引擎。识别用户意图（企业/行业/城市/产业链/政策/供应商/一般问题），给出结构化、专业的分析，包含要点、数据点与可执行建议。",
  consultant:
    "你是麦肯锡级别的中国市场进入战略顾问，服务欧洲企业。输出完整、结构化的咨询方案：现状、选项、建议、行动路线图、风险。",
  report:
    "你是咨询报告生成引擎。按咨询公司标准输出带标题层级的报告：执行摘要、市场概览、分析、建议、风险、结论。使用 Markdown 标题与要点。",
  company:
    "你是企业情报分析师。针对指定中国企业输出：概览、SWOT、波特五力、竞争格局、供应链位置、风险与 AI 建议。",
  playbook:
    "你是中国市场攻略（Playbook）生成器。输出：目标、适用企业、准备工作、办理流程、预计时间与成本、涉及政府部门、关键风险、行动清单、AI 建议。",
};

// Modes that benefit from grounding in the platform's ingested data.
const RAG_MODES = new Set(["search", "consultant", "report", "company"]);

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    return m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
  }
  return "";
}

export async function POST(req: Request) {
  const { messages, mode = "search", lang = "zh" }: {
    messages: UIMessage[]; mode?: string; lang?: string;
  } = await req.json();

  if (!process.env.DEEPSEEK_API_KEY) {
    return new Response(
      JSON.stringify({ error: "DEEPSEEK_API_KEY 未配置。请在 .env.local 中设置。" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // RAG: retrieve relevant records from the platform database.
  let ragContext = "";
  let ragSources: { n: number; kind: string; title: string; url: string }[] = [];
  if (RAG_MODES.has(mode)) {
    const r = await retrieve(lastUserText(messages), 6);
    ragContext = r.context;
    ragSources = r.sources;
  }

  const base = `${MODE_PROMPT[mode] ?? MODE_PROMPT.search}
${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.zh}
重要：所有分析尽量标注数据来源。如信息不确定，请明确说明为估算或需进一步核实。`;

  const system = ragContext
    ? `${base}

以下是从 China MOS 平台数据库检索到的相关资料（均来自真实公开数据源：Wikipedia、Wikidata、OpenAlex、UN Comtrade、World Bank、Yahoo Finance、OpenStreetMap 等）。请**优先基于这些资料作答**，并在引用某条资料时用 [n] 标注（n 为资料编号）。若资料不足以回答，可结合你的知识，但需说明。

<检索资料>
${ragContext}
</检索资料>`
    : base;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Send retrieved sources first so the client can render citations.
      if (ragSources.length) {
        writer.write({ type: "data-sources", data: ragSources });
      }
      const result = streamText({
        model: deepseek("deepseek-chat"),
        system,
        messages: await convertToModelMessages(messages),
        temperature: 0.5,
      });
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
