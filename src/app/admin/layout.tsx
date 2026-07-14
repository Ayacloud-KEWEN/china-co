import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "概览" },
  { href: "/admin/companies", label: "企业" },
  { href: "/admin/industries", label: "行业" },
  { href: "/admin/cities", label: "城市" },
  { href: "/admin/policies", label: "政策" },
  { href: "/admin/suppliers", label: "供应商" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isPlatformAdmin(user)) redirect("/");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">管理后台</h1>
          <p className="text-xs text-muted">运营控制台 · 无需改代码即可维护数据</p>
        </div>
        <Link href="/" className="text-xs text-muted hover:text-accent">← 返回前台</Link>
      </div>
      <nav className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-background hover:text-foreground">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
