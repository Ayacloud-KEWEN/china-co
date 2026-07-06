import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import type { User } from "@/db/schema";

const COOKIE = "mos_session";
const SESSION_DAYS = 30;

// --- Password hashing (Node scrypt, no external dep) ---
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const test = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return key.length === test.length && timingSafeEqual(key, test);
}

// --- Sessions ---
async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(schema.sessions).values({ token, userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db.select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
  jar.delete(COOKIE);
}

// --- Signup / login ---
export async function signup(email: string, password: string, name: string, orgName: string) {
  email = email.trim().toLowerCase();
  if (!email || !password || password.length < 6) return { error: "邮箱无效或密码至少 6 位" };
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length) return { error: "该邮箱已注册" };

  const [org] = await db.insert(schema.organizations).values({ name: orgName || `${name} 的团队` }).returning();
  const [user] = await db.insert(schema.users).values({
    email, passwordHash: hashPassword(password), name: name || email.split("@")[0], orgId: org.id, role: "owner",
  }).returning();
  await createSession(user.id);
  return { ok: true };
}

export async function login(email: string, password: string) {
  email = email.trim().toLowerCase();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "邮箱或密码错误" };
  await createSession(user.id);
  return { ok: true };
}
