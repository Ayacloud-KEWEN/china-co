import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/queries";
import { CityView } from "./city-view";

export const dynamic = "force-dynamic";

export default async function CityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCityBySlug(slug);
  if (!c) return notFound();
  return <CityView c={c} />;
}
