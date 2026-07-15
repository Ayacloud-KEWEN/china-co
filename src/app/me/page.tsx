import { redirect } from "next/navigation";
import { and, desc, eq, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getSubscriptions } from "@/lib/notifications";
import { MeView } from "./me-view";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [org] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, user.orgId)).limit(1);
  const [watchlist, notes, analyses, members, subscriptions] = await Promise.all([
    db.select().from(schema.watchlist).where(eq(schema.watchlist.userId, user.id)).orderBy(desc(schema.watchlist.createdAt)),
    db.select().from(schema.notes).where(eq(schema.notes.userId, user.id)).orderBy(desc(schema.notes.updatedAt)),
    db.select().from(schema.savedAnalyses)
      .where(or(eq(schema.savedAnalyses.userId, user.id), and(eq(schema.savedAnalyses.orgId, user.orgId), eq(schema.savedAnalyses.shared, true))))
      .orderBy(desc(schema.savedAnalyses.createdAt)),
    db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role }).from(schema.users).where(eq(schema.users.orgId, user.orgId)),
    getSubscriptions(user.id),
  ]);

  return (
    <MeView
      user={{ id: user.id, name: user.name, email: user.email, role: user.role }}
      orgName={org?.name ?? "我的团队"}
      watchlist={watchlist} notes={notes} analyses={analyses} members={members} subscriptions={subscriptions}
    />
  );
}
