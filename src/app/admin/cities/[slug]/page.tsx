import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/queries";
import { CityForm } from "../city-form";

export const dynamic = "force-dynamic";

export default async function EditCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑城市 · {city.name}</h2>
      <CityForm city={city} />
    </div>
  );
}
