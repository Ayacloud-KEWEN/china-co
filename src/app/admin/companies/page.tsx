import { db, schema } from "@/db";
import { deleteCompany } from "@/app/actions/admin";
import { AdminList } from "./list-view";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const rows = await db.select({
    slug: schema.companies.slug, name: schema.companies.name, nameEn: schema.companies.nameEn,
    industry: schema.companies.industry, city: schema.companies.city, logo: schema.companies.logo,
  }).from(schema.companies).orderBy(schema.companies.name);

  return <AdminList title="企业" rows={rows} basePath="/admin/companies" onDelete={deleteCompany} />;
}
