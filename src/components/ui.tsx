import { ReactNode } from "react";
import Link from "next/link";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-surface p-5 shadow-sm ${className}`}>{children}</div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "green" | "amber" | "red" | "blue" }) {
  const tones: Record<string, string> = {
    default: "bg-background text-muted",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Stat({ label, value, trend, up }: { label: string; value: string; trend?: string; up?: boolean }) {
  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {trend && (
        <div className={`mt-0.5 text-xs font-medium ${up ? "text-emerald-500" : "text-red-500"}`}>
          {up ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

export function LinkCard({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block rounded-xl border bg-surface p-4 transition hover:border-accent hover:shadow-md">
      {children}
    </Link>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const tone = score < 30 ? "green" : score < 45 ? "amber" : "red";
  const label = score < 30 ? "低风险" : score < 45 ? "中风险" : "高风险";
  return <Badge tone={tone}>{label} · {score}</Badge>;
}
