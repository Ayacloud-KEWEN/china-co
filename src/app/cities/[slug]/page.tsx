import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getEntityState } from "@/lib/user-data";
import { EntityUserPanel } from "@/components/entity-user-panel";
import { CityView } from "./city-view";

export const dynamic = "force-dynamic";

export default async function CityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCityBySlug(slug);
  if (!c) return notFound();
  const user = await getCurrentUser();
  const state = user ? await getEntityState(user.id, "city", slug) : null;
  return (
    <div className="space-y-6">
      <EntityUserPanel entityType="city" entitySlug={slug} label={c.name} loggedIn={!!user} initialWatching={state?.watching} initialNote={state?.note} />
      <CityView c={c} />
    </div>
  );
}
