import { CitiesView } from "./cities-view";
import { getCities, getProvinces } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  return <CitiesView cities={cities} provinces={provinces} />;
}
