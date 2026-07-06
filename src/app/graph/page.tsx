"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { PageHeader, Card, SectionTitle } from "@/components/ui";

type Node = { id: string; label: string; type: string; x: number; y: number };
type Edge = { from: string; to: string; label: string };

const nodes: Node[] = [
  { id: "byd", label: "比亚迪", type: "企业", x: 400, y: 200 },
  { id: "catl", label: "宁德时代", type: "企业", x: 620, y: 130 },
  { id: "wang", label: "王传福", type: "创始人", x: 260, y: 120 },
  { id: "shenzhen", label: "深圳", type: "城市", x: 300, y: 320 },
  { id: "battery", label: "刀片电池", type: "产品", x: 560, y: 300 },
  { id: "nev", label: "新能源汽车", type: "产业", x: 480, y: 60 },
  { id: "sunwoda", label: "欣旺达", type: "供应商", x: 680, y: 260 },
  { id: "eu", label: "欧洲市场", type: "市场", x: 180, y: 240 },
];

const edges: Edge[] = [
  { from: "wang", to: "byd", label: "创立" },
  { from: "byd", to: "shenzhen", label: "总部" },
  { from: "byd", to: "battery", label: "生产" },
  { from: "byd", to: "nev", label: "属于" },
  { from: "catl", to: "nev", label: "属于" },
  { from: "byd", to: "catl", label: "竞争" },
  { from: "sunwoda", to: "byd", label: "供应" },
  { from: "byd", to: "eu", label: "出口" },
];

const typeColor: Record<string, string> = {
  企业: "#2563eb", 创始人: "#7c3aed", 城市: "#059669", 产品: "#d97706",
  产业: "#dc2626", 供应商: "#0891b2", 市场: "#db2777",
};

export default function GraphPage() {
  const t = useT();
  const [active, setActive] = useState<string | null>("byd");
  const connected = new Set<string>();
  if (active) {
    edges.forEach((e) => { if (e.from === active) connected.add(e.to); if (e.to === active) connected.add(e.from); });
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.graph")} subtitle="企业知识图谱 —— 无限探索企业、创始人、投资机构、供应商、产品、产业、城市与政策之间的关系。" />
      <Card>
        <SectionTitle>关系网络（示例：比亚迪）</SectionTitle>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 800 380" className="w-full min-w-[640px]">
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const on = active && (e.from === active || e.to === active);
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "var(--accent)" : "var(--border)"} strokeWidth={on ? 2 : 1} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} textAnchor="middle" className="fill-muted text-[10px]">{e.label}</text>
                </g>
              );
            })}
            {nodes.map((n) => {
              const dim = active && n.id !== active && !connected.has(n.id);
              return (
                <g key={n.id} onClick={() => setActive(n.id)} className="cursor-pointer" opacity={dim ? 0.35 : 1}>
                  <circle cx={n.x} cy={n.y} r={n.id === active ? 30 : 24} fill={typeColor[n.type]} opacity={0.15} />
                  <circle cx={n.x} cy={n.y} r={7} fill={typeColor[n.type]} />
                  <text x={n.x} y={n.y - 12} textAnchor="middle" className="fill-foreground text-[12px] font-medium">{n.label}</text>
                  <text x={n.x} y={n.y + 22} textAnchor="middle" className="text-[9px]" fill={typeColor[n.type]}>{n.type}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(typeColor).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />{type}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
