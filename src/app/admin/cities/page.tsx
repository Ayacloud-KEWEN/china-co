import { db, schema } from "@/db";
import { deleteCity } from "@/app/actions/admin";
import { AdminList } from "../companies/list-view";

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  const raw = await db.select({
    slug: schema.cities.slug, name: schema.cities.name, nameEn: schema.cities.nameEn, gdp: schema.cities.gdp,
  }).from(schema.cities).orderBy(schema.cities.name);

  const rows = raw.map((r) => ({ slug: r.slug, name: r.name, nameEn: r.nameEn, industry: r.gdp, city: "", logo: "🏙️" }));
  return <AdminList title="城市" rows={rows} basePath="/admin/cities" onDelete={deleteCity} />;
}
