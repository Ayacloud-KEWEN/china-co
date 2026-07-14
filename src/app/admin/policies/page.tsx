import { db, schema } from "@/db";
import { deletePolicy } from "@/app/actions/admin";
import { AdminList } from "../companies/list-view";

export const dynamic = "force-dynamic";

const impactLogo: Record<string, string> = { 高: "🔴", 中: "🟡", 低: "🟢" };

export default async function AdminPoliciesPage() {
  const raw = await db.select().from(schema.policies).orderBy(schema.policies.date);
  const rows = raw.map((r) => ({
    slug: r.slug, name: r.title?.zh ?? r.slug, nameEn: "", industry: r.org, city: r.date,
    logo: impactLogo[r.impact] ?? "📄",
  }));
  return <AdminList title="政策" rows={rows} basePath="/admin/policies" onDelete={deletePolicy} />;
}
