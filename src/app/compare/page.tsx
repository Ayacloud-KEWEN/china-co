import { CompareView } from "./compare-view";
import { getCompanies, getIndustries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const [companies, industries] = await Promise.all([getCompanies(), getIndustries()]);
  return <CompareView companies={companies} industries={industries} />;
}
