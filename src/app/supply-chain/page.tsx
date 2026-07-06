import { SupplyView } from "./supply-view";
import { getSuppliers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SupplyChainPage() {
  const suppliers = await getSuppliers();
  return <SupplyView suppliers={suppliers} />;
}
