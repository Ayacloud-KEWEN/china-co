import { PolicyView } from "./policy-view";
import { getPolicies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PolicyPage() {
  const policies = await getPolicies();
  return <PolicyView policies={policies} />;
}
