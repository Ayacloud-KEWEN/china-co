"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";

export async function addSubscription(keyword: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "请先登录" };
  const kw = keyword.trim();
  if (!kw) return { error: "请输入关键词" };
  if (kw.length > 40) return { error: "关键词过长" };
  await db.insert(schema.subscriptions)
    .values({ userId: user.id, orgId: user.orgId, keyword: kw })
    .onConflictDoNothing();
  revalidatePath("/me");
  return { ok: true };
}

export async function removeSubscription(id: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "请先登录" };
  await db.delete(schema.subscriptions)
    .where(and(eq(schema.subscriptions.id, id), eq(schema.subscriptions.userId, user.id)));
  revalidatePath("/me");
  return { ok: true };
}

export async function markNotificationRead(id: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(schema.notifications).set({ read: true })
    .where(and(eq(schema.notifications.id, id), eq(schema.notifications.userId, user.id)));
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(schema.notifications).set({ read: true })
    .where(and(eq(schema.notifications.userId, user.id), eq(schema.notifications.read, false)));
  revalidatePath("/");
}
