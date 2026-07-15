import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Policy } from "@/db/schema";
import { sendPolicyAlertEmail } from "@/lib/email";

// --- Reads ---
export const getSubscriptions = (userId: number) =>
  db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId)).orderBy(desc(schema.subscriptions.createdAt));

export const getNotifications = (userId: number, limit = 20) =>
  db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt)).limit(limit);

export async function getUnreadCount(userId: number): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false)));
  return row?.n ?? 0;
}

// --- Fan-out: create notifications for subscribers matching a new policy ---
// Matches a subscription keyword (case-insensitive substring) against the policy's
// trilingual title, tags and summary. Deduped per user via the notif_uniq index.
export async function fanoutPolicyNotifications(policy: Policy): Promise<number> {
  const subs = await db.select().from(schema.subscriptions);
  if (!subs.length) return 0;

  const hay = [
    policy.title?.zh, policy.title?.en, policy.title?.fr,
    policy.summary?.zh, policy.summary?.en, policy.summary?.fr,
    ...(policy.tags ?? []),
  ].filter(Boolean).join(" ").toLowerCase();

  // One notification per matching user (a user with several matching keywords still
  // gets a single alert; we keep the first keyword that matched for the message).
  const perUser = new Map<number, string>();
  for (const s of subs) {
    if (!perUser.has(s.userId) && hay.includes(s.keyword.toLowerCase())) {
      perUser.set(s.userId, s.keyword);
    }
  }
  if (!perUser.size) return 0;

  const rows = [...perUser.entries()].map(([userId, keyword]) => ({
    userId,
    kind: "policy",
    title: `新政策匹配「${keyword}」：${policy.title?.zh ?? policy.slug}`,
    body: policy.summary?.zh ?? "",
    url: policy.sourceUrl ?? "",
    refKey: `policy:${policy.slug}`,
  }));

  await db.insert(schema.notifications).values(rows).onConflictDoNothing();

  // Optional email (no-op unless RESEND_API_KEY is configured).
  const userIds = rows.map((r) => r.userId);
  const users = await db.select({ id: schema.users.id, email: schema.users.email, name: schema.users.name })
    .from(schema.users).where(sql`${schema.users.id} = ANY(${userIds})`);
  await Promise.all(users.map((u) =>
    sendPolicyAlertEmail(u.email, u.name, policy.title?.zh ?? policy.slug, policy.summary?.zh ?? "", policy.sourceUrl ?? "").catch(() => {}),
  ));

  return rows.length;
}
