import { notFound } from "next/navigation";
import { getIndustryBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getEntityState } from "@/lib/user-data";
import { EntityUserPanel } from "@/components/entity-user-panel";
import { IndustryView } from "./industry-view";

export const dynamic = "force-dynamic";

export default async function IndustryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = await getIndustryBySlug(slug);
  if (!ind) return notFound();
  const user = await getCurrentUser();
  const state = user ? await getEntityState(user.id, "industry", slug) : null;
  return (
    <div className="space-y-6">
      <EntityUserPanel entityType="industry" entitySlug={slug} label={ind.name} loggedIn={!!user} initialWatching={state?.watching} initialNote={state?.note} />
      <IndustryView ind={ind} />
    </div>
  );
}
