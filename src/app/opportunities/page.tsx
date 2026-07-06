import { OpportunitiesView } from "./opportunities-view";
import { getFairs, getTenders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const [fairs, tenders] = await Promise.all([getFairs(), getTenders()]);
  return <OpportunitiesView fairs={fairs} tenders={tenders} />;
}
