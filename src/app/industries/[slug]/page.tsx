import { notFound } from "next/navigation";
import { getIndustryBySlug } from "@/lib/queries";
import { IndustryView } from "./industry-view";

export const dynamic = "force-dynamic";

export default async function IndustryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = await getIndustryBySlug(slug);
  if (!ind) return notFound();
  return <IndustryView ind={ind} />;
}
