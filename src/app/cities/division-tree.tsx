"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle, Badge } from "@/components/ui";
import type { DivisionNode } from "@/lib/queries";

const LEVEL_LABEL: Record<string, string> = {
  province: "省级", city: "地级", district: "区县", town: "乡镇",
};

// Where a node links: a researched city page when one is linked, otherwise the
// generic area page (which shows whatever intel has been filled in so far).
const href = (n: DivisionNode) => (n.citySlug ? `/cities/${n.citySlug}` : `/cities/area/${n.code}`);

function Node({ node, childrenOf, depth }: {
  node: DivisionNode;
  childrenOf: Map<string, DivisionNode[]>;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const kids = childrenOf.get(node.code) ?? [];

  return (
    <div>
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: depth * 16 }}>
        {kids.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `收起 ${node.name}` : `展开 ${node.name}`}
            className="h-5 w-5 shrink-0 rounded text-xs text-muted transition hover:bg-background"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <Link href={href(node)} className="truncate text-sm transition hover:text-accent hover:underline">
          {node.name}
        </Link>
        {node.citySlug && <Badge tone="blue">情报</Badge>}
        {node.pop && <span className="text-[11px] text-muted">{node.pop}人</span>}
        {kids.length > 0 && <span className="text-[11px] text-muted">· {kids.length}</span>}
      </div>
      {open && kids.map((k) => <Node key={k.code} node={k} childrenOf={childrenOf} depth={depth + 1} />)}
    </div>
  );
}

export function DivisionTree({ nodes }: { nodes: DivisionNode[] }) {
  const [q, setQ] = useState("");

  const { roots, childrenOf } = useMemo(() => {
    const childrenOf = new Map<string, DivisionNode[]>();
    const roots: DivisionNode[] = [];
    for (const n of nodes) {
      if (n.parentCode) {
        const arr = childrenOf.get(n.parentCode);
        if (arr) arr.push(n);
        else childrenOf.set(n.parentCode, [n]);
      } else roots.push(n);
    }
    return { roots, childrenOf };
  }, [nodes]);

  // Search short-circuits the tree: flat hits with their full ancestor path.
  const byCode = useMemo(() => new Map(nodes.map((n) => [n.code, n])), [nodes]);
  const hits = useMemo(() => {
    const term = q.trim();
    if (!term) return null;
    return nodes.filter((n) => n.name.includes(term) || n.code.startsWith(term)).slice(0, 60);
  }, [q, nodes]);

  const pathOf = (n: DivisionNode) => {
    const parts: string[] = [];
    let cur: DivisionNode | undefined = n.parentCode ? byCode.get(n.parentCode) : undefined;
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentCode ? byCode.get(cur.parentCode) : undefined;
    }
    return parts.join(" / ");
  };

  return (
    <Card>
      <SectionTitle>全国行政区划 · {nodes.length} 个（省 / 地级市 / 区县）</SectionTitle>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索省 / 市 / 区县名称或区划代码，如「顺德」「440606」"
        className="mb-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {hits ? (
        <div className="max-h-[28rem] space-y-1 overflow-y-auto">
          {hits.length === 0 && <div className="py-6 text-center text-sm text-muted">没有匹配的行政区。</div>}
          {hits.map((n) => (
            <Link key={n.code} href={href(n)} className="block rounded-lg px-2 py-1.5 transition hover:bg-background">
              <div className="flex items-center gap-2 text-sm">
                <span>{n.name}</span>
                <Badge>{LEVEL_LABEL[n.level] ?? n.level}</Badge>
                <span className="text-[11px] text-muted">{n.code}</span>
                {n.pop && <span className="text-[11px] text-muted">{n.pop}人</span>}
              </div>
              {pathOf(n) && <div className="text-[11px] text-muted">{pathOf(n)}</div>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto">
          {roots.map((r) => <Node key={r.code} node={r} childrenOf={childrenOf} depth={0} />)}
        </div>
      )}

      <div className="mt-3 text-[11px] text-muted">
        结构基于国标行政区划代码（GB/T 2260）。各级情报内容可在后台逐步补充。
      </div>
    </Card>
  );
}
