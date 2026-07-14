import { notFound } from "next/navigation";
import { getIndustryBySlug } from "@/lib/queries";
import { IndustryForm } from "../industry-form";

export const dynamic = "force-dynamic";

export default async function EditIndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑行业 · {industry.name}</h2>
      <IndustryForm industry={industry} />
    </div>
  );
}
