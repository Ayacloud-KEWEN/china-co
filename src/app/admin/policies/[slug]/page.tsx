import { notFound } from "next/navigation";
import { getPolicyBySlug } from "@/lib/queries";
import { PolicyForm } from "../policy-form";

export const dynamic = "force-dynamic";

export default async function EditPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);
  if (!policy) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑政策 · {policy.title?.zh ?? policy.slug}</h2>
      <PolicyForm policy={policy} />
    </div>
  );
}
