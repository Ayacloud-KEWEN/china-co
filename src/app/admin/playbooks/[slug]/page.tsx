import { notFound } from "next/navigation";
import { getPlaybookBySlug } from "@/lib/queries";
import { PlaybookForm } from "../playbook-form";

export const dynamic = "force-dynamic";

export default async function EditPlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybookBySlug(slug);
  if (!playbook) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑攻略 · {playbook.title?.zh ?? playbook.slug}</h2>
      <PlaybookForm playbook={playbook} />
    </div>
  );
}
