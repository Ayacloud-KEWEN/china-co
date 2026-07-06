"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("请先登录");
  return user;
}

export async function toggleWatch(entityType: string, entitySlug: string, label: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "请先登录" };
  const existing = await db.select().from(schema.watchlist)
    .where(and(eq(schema.watchlist.userId, user.id), eq(schema.watchlist.entityType, entityType), eq(schema.watchlist.entitySlug, entitySlug)))
    .limit(1);
  if (existing.length) {
    await db.delete(schema.watchlist).where(eq(schema.watchlist.id, existing[0].id));
    return { watching: false };
  }
  await db.insert(schema.watchlist).values({ userId: user.id, orgId: user.orgId, entityType, entitySlug, label });
  return { watching: true };
}

export async function saveNote(entityType: string, entitySlug: string, body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "请先登录" };
  if (!body.trim()) {
    await db.delete(schema.notes).where(and(eq(schema.notes.userId, user.id), eq(schema.notes.entityType, entityType), eq(schema.notes.entitySlug, entitySlug)));
    return { ok: true };
  }
  await db.insert(schema.notes)
    .values({ userId: user.id, orgId: user.orgId, entityType, entitySlug, body, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [schema.notes.userId, schema.notes.entityType, schema.notes.entitySlug], set: { body, updatedAt: new Date() } });
  return { ok: true };
}

export async function saveAnalysis(title: string, mode: string, content: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "请先登录" };
  if (!content.trim()) return { error: "内容为空" };
  await db.insert(schema.savedAnalyses).values({
    userId: user.id, orgId: user.orgId, authorName: user.name, title: title.slice(0, 120), mode, content,
  });
  return { ok: true };
}

export async function deleteAnalysis(id: number) {
  const user = await requireUser();
  await db.delete(schema.savedAnalyses).where(and(eq(schema.savedAnalyses.id, id), eq(schema.savedAnalyses.userId, user.id)));
  revalidatePath("/me");
}

export async function toggleShareAnalysis(id: number) {
  const user = await requireUser();
  const [a] = await db.select().from(schema.savedAnalyses).where(and(eq(schema.savedAnalyses.id, id), eq(schema.savedAnalyses.userId, user.id))).limit(1);
  if (a) await db.update(schema.savedAnalyses).set({ shared: !a.shared }).where(eq(schema.savedAnalyses.id, id));
  revalidatePath("/me");
}

export async function removeWatch(id: number) {
  const user = await requireUser();
  await db.delete(schema.watchlist).where(and(eq(schema.watchlist.id, id), eq(schema.watchlist.userId, user.id)));
  revalidatePath("/me");
}
