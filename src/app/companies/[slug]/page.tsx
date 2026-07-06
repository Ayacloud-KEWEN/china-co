import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getEntityState } from "@/lib/user-data";
import { EntityUserPanel } from "@/components/entity-user-panel";
import { CompanyView } from "./company-view";

export const dynamic = "force-dynamic";

export default async function CompanyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) return notFound();
  const user = await getCurrentUser();
  const state = user ? await getEntityState(user.id, "company", slug) : null;
  return (
    <div className="space-y-6">
      <EntityUserPanel entityType="company" entitySlug={slug} label={c.name} loggedIn={!!user} initialWatching={state?.watching} initialNote={state?.note} />
      <CompanyView c={c} />
    </div>
  );
}
