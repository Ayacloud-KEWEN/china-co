import { IndustriesView } from "./industries-view";
import { getIndustries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const industries = await getIndustries();
  return <IndustriesView industries={industries} />;
}
