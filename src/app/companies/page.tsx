import { CompaniesView } from "./companies-view";
import { getCompanies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesView companies={companies} />;
}
