import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function getEntityState(userId: number, entityType: string, entitySlug: string) {
  const [w] = await db.select().from(schema.watchlist)
    .where(and(eq(schema.watchlist.userId, userId), eq(schema.watchlist.entityType, entityType), eq(schema.watchlist.entitySlug, entitySlug))).limit(1);
  const [n] = await db.select().from(schema.notes)
    .where(and(eq(schema.notes.userId, userId), eq(schema.notes.entityType, entityType), eq(schema.notes.entitySlug, entitySlug))).limit(1);
  return { watching: !!w, note: n?.body ?? "" };
}
