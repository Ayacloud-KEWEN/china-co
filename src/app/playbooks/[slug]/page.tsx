import { notFound } from "next/navigation";
import { getPlaybookBySlug } from "@/lib/queries";
import { PlaybookView } from "./playbook-view";

export const dynamic = "force-dynamic";

export default async function PlaybookDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPlaybookBySlug(slug);
  if (!p) return notFound();
  return <PlaybookView p={p} />;
}
