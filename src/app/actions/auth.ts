"use server";

import { redirect } from "next/navigation";
import { signup, login, logout } from "@/lib/auth";

export async function signupAction(_prev: { error?: string } | null, formData: FormData) {
  const res = await signup(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
    String(formData.get("name") ?? ""),
    String(formData.get("org") ?? ""),
  );
  if (res.error) return { error: res.error };
  redirect("/me");
}

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const res = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (res.error) return { error: res.error };
  redirect("/me");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
