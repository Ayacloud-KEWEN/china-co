import { db, schema } from "@/db";
import { deleteSupplier } from "@/app/actions/admin";
import { AdminList } from "../companies/list-view";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const raw = await db.select({
    slug: schema.suppliers.slug, name: schema.suppliers.name,
    category: schema.suppliers.category, city: schema.suppliers.city,
  }).from(schema.suppliers).orderBy(schema.suppliers.name);

  const rows = raw.map((r) => ({ slug: r.slug, name: r.name, nameEn: "", industry: r.category, city: r.city, logo: "🏭" }));
  return <AdminList title="供应商" rows={rows} basePath="/admin/suppliers" onDelete={deleteSupplier} />;
}
