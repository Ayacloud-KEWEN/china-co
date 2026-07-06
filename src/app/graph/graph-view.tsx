"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import type { Graph } from "@/lib/graph";

const kindColor: Record<string, string> = {
  企业: "#2563eb", 行业: "#dc2626", 城市: "#059669", 市场: "#db2777", 供应商: "#0891b2",
};

// Seeded RNG for a stable layout across renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 820, H = 560;

// Fruchterman–Reingold force-directed layout.
function layout(g: Graph): Record<string, { x: number; y: number }> {
  const rnd = mulberry32(42);
  const n = g.nodes.length || 1;
  const k = Math.sqrt((W * H) / n) * 0.62;
  const pos: Record<string, { x: number; y: number }> = {};
  g.nodes.forEach((nd, i) => {
    const a = (i / n) * Math.PI * 2;
    pos[nd.id] = { x: W / 2 + Math.cos(a) * 180 + (rnd() - 0.5) * 40, y: H / 2 + Math.sin(a) * 140 + (rnd() - 0.5) * 40 };
  });
  const cx = W / 2, cy = H / 2;
  for (let iter = 0; iter < 320; iter++) {
    const temp = 30 * (1 - iter / 320);
    const disp: Record<string, { x: number; y: number }> = {};
    for (const nd of g.nodes) disp[nd.id] = { x: 0, y: 0 };
    for (let i = 0; i < g.nodes.length; i++) {
      for (let j = i + 1; j < g.nodes.length; j++) {
        const a = g.nodes[i], b = g.nodes[j];
        let dx = pos[a.id].x - pos[b.id].x, dy = pos[a.id].y - pos[b.id].y;
        let d = Math.hypot(dx, dy) || 0.01; if (d < 0.01) { dx = rnd(); dy = rnd(); d = 0.02; }
        const f = (k * k) / d;
        disp[a.id].x += (dx / d) * f; disp[a.id].y += (dy / d) * f;
        disp[b.id].x -= (dx / d) * f; disp[b.id].y -= (dy / d) * f;
      }
    }
    for (const e of g.edges) {
      if (!pos[e.from] || !pos[e.to]) continue;
      const dx = pos[e.from].x - pos[e.to].x, dy = pos[e.from].y - pos[e.to].y;
      const d = Math.hypot(dx, dy) || 0.01;
      const f = (d * d) / k;
      disp[e.from].x -= (dx / d) * f; disp[e.from].y -= (dy / d) * f;
      disp[e.to].x += (dx / d) * f; disp[e.to].y += (dy / d) * f;
    }
    for (const nd of g.nodes) {
      disp[nd.id].x += (cx - pos[nd.id].x) * 0.03;
      disp[nd.id].y += (cy - pos[nd.id].y) * 0.03;
      const d = Math.hypot(disp[nd.id].x, disp[nd.id].y) || 0.01;
      pos[nd.id].x += (disp[nd.id].x / d) * Math.min(d, temp);
      pos[nd.id].y += (disp[nd.id].y / d) * Math.min(d, temp);
      pos[nd.id].x = Math.max(40, Math.min(W - 40, pos[nd.id].x));
      pos[nd.id].y = Math.max(30, Math.min(H - 30, pos[nd.id].y));
    }
  }
  return pos;
}

export function GraphView({ graph }: { graph: Graph }) {
  const t = useT();
  const pos = useMemo(() => layout(graph), [graph]);
  const [active, setActive] = useState<string | null>(null);

  const neighbors = useMemo(() => {
    if (!active) return new Set<string>();
    const s = new Set<string>();
    for (const e of graph.edges) { if (e.from === active) s.add(e.to); if (e.to === active) s.add(e.from); }
    return s;
  }, [active, graph.edges]);

  const activeNode = graph.nodes.find((n) => n.id === active);

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.graph")} subtitle={`企业知识图谱 —— 基于平台真实数据自动生成：${graph.nodes.length} 个节点、${graph.edges.length} 条关系。点击节点高亮其关系网络。`} />
      <Card>
        <SectionTitle>关系网络（企业 · 行业 · 城市 · 供应商 · 出口市场）</SectionTitle>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[680px]">
            {graph.edges.map((e, i) => {
              const a = pos[e.from], b = pos[e.to];
              if (!a || !b) return null;
              const on = active && (e.from === active || e.to === active);
              return (
                <g key={i} opacity={active && !on ? 0.12 : 1}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "var(--accent)" : "var(--border)"} strokeWidth={on ? 1.8 : 1} />
                  {on && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} textAnchor="middle" className="fill-muted text-[9px]">{e.label}</text>}
                </g>
              );
            })}
            {graph.nodes.map((nd) => {
              const p = pos[nd.id]; if (!p) return null;
              const dim = active && nd.id !== active && !neighbors.has(nd.id);
              const r = nd.kind === "企业" ? 8 : 6;
              return (
                <g key={nd.id} transform={`translate(${p.x},${p.y})`} opacity={dim ? 0.25 : 1} className="cursor-pointer" onClick={() => setActive(active === nd.id ? null : nd.id)}>
                  <circle r={r + 8} fill={kindColor[nd.kind] ?? "#64748b"} opacity={0.12} />
                  <circle r={r} fill={kindColor[nd.kind] ?? "#64748b"} />
                  <text y={-r - 5} textAnchor="middle" className="fill-foreground text-[11px] font-medium">{nd.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(kindColor).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />{k}</span>
          ))}
        </div>
      </Card>

      {activeNode && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted">{activeNode.kind}</span>
              <div className="text-lg font-semibold">{activeNode.label}</div>
            </div>
            {activeNode.url && <Link href={activeNode.url} className="text-sm text-accent hover:underline">查看详情 →</Link>}
          </div>
          <div className="mt-2 text-sm text-muted">
            关系：{graph.edges.filter((e) => e.from === active || e.to === active).map((e, i) => {
              const otherId = e.from === active ? e.to : e.from;
              const other = graph.nodes.find((n) => n.id === otherId);
              return <span key={i} className="mr-2 inline-block">{e.label} · {other?.label}</span>;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
