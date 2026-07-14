import "server-only";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/db/schema";

// A user is a platform admin if the DB flag is set, OR their email is listed in
// ADMIN_EMAILS (comma-separated). The env list bootstraps the first admin before
// anyone can be promoted through the console.
const bootstrapEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isPlatformAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.isAdmin || bootstrapEmails.includes(user.email.toLowerCase());
}

/** Returns the current user if they are a platform admin, otherwise null. */
export async function getAdminUser(): Promise<User | null> {
  const user = await getCurrentUser();
  return isPlatformAdmin(user) ? user : null;
}

/** Throws if the caller is not a platform admin. Use to guard server actions. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("需要管理员权限");
  return user;
}
