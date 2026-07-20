import { CitiesView } from "./cities-view";
import { DivisionTree } from "./division-tree";
import { getCities, getProvinces, getDivisionTree } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  const [cities, provinces, divisions] = await Promise.all([getCities(), getProvinces(), getDivisionTree()]);
  return (
    <div className="space-y-6">
      <CitiesView cities={cities} provinces={provinces} />
      {divisions.length > 0 && <DivisionTree nodes={divisions} />}
    </div>
  );
}
