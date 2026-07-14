import { db, schema } from "@/db";
import { deleteIndustry } from "@/app/actions/admin";
import { AdminList } from "../companies/list-view";

export const dynamic = "force-dynamic";

export default async function AdminIndustriesPage() {
  const raw = await db.select({
    slug: schema.industries.slug, name: schema.industries.name, nameEn: schema.industries.nameEn,
    marketSize: schema.industries.marketSize, icon: schema.industries.icon,
  }).from(schema.industries).orderBy(schema.industries.name);

  const rows = raw.map((r) => ({ slug: r.slug, name: r.name, nameEn: r.nameEn, industry: r.marketSize, city: "", logo: r.icon }));
  return <AdminList title="行业" rows={rows} basePath="/admin/industries" onDelete={deleteIndustry} />;
}
