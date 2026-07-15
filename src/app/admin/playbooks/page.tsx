import { db, schema } from "@/db";
import { deletePlaybook } from "@/app/actions/admin";
import { AdminList } from "../companies/list-view";

export const dynamic = "force-dynamic";

export default async function AdminPlaybooksPage() {
  const raw = await db.select().from(schema.playbooks).orderBy(schema.playbooks.category);
  const rows = raw.map((r) => ({
    slug: r.slug, name: r.title?.zh ?? r.slug, nameEn: "",
    industry: r.category, city: `${r.steps?.length ?? 0} 步`, logo: "📘",
  }));
  return <AdminList title="攻略" rows={rows} basePath="/admin/playbooks" onDelete={deletePlaybook} />;
}
