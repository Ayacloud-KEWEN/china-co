import Link from "next/link";
import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { Card, SectionTitle } from "@/components/ui";
import { ReembedButton } from "./reembed-button";

export const dynamic = "force-dynamic";

async function count(table: PgTable) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
  return row?.n ?? 0;
}

export default async function AdminDashboard() {
  const [companies, industries, cities, divisions, policies, suppliers, playbooks, ragDocs, users] = await Promise.all([
    count(schema.companies),
    count(schema.industries),
    count(schema.cities),
    count(schema.divisions),
    count(schema.policies),
    count(schema.suppliers),
    count(schema.playbooks),
    count(schema.ragDocs),
    count(schema.users),
  ]);

  const cards = [
    { label: "企业", n: companies, href: "/admin/companies" },
    { label: "行业", n: industries, href: "/admin/industries" },
    { label: "城市", n: cities, href: "/admin/cities" },
    { label: "行政区划", n: divisions, href: "/admin/divisions" },
    { label: "政策", n: policies, href: "/admin/policies" },
    { label: "供应商", n: suppliers, href: "/admin/suppliers" },
    { label: "攻略", n: playbooks, href: "/admin/playbooks" },
    { label: "向量文档", n: ragDocs, href: null },
    { label: "注册用户", n: users, href: null },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const body = (
            <>
              <div className="text-xs text-muted">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold">{c.n}</div>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="rounded-xl border bg-surface p-4 transition hover:border-accent hover:shadow-md">{body}</Link>
          ) : (
            <div key={c.label} className="rounded-xl border bg-surface p-4">{body}</div>
          );
        })}
      </div>

      <Card>
        <SectionTitle>数据运维</SectionTitle>
        <p className="mb-3 text-sm text-muted">
          新增或修改企业/行业/城市后，前台页面会立即读库更新。若要让新内容进入 <strong>AI 搜索与问答</strong>（向量检索），
          需重建向量索引。
        </p>
        <ReembedButton />
        <p className="mt-2 text-[11px] text-muted">
          重建为后台任务（运行 <code>db:embed</code>），依数据量约需 1–3 分钟，期间前台照常可用。
        </p>
      </Card>
    </div>
  );
}
