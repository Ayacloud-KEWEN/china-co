"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, Search, Building2, Factory, MapPin, Truck, ScrollText, BookOpen,
  Network, MessageSquare, FileText, Users, Moon, Sun, Globe, Menu, X, Briefcase, GitCompare, User, LogOut, Star, Shield,
} from "lucide-react";
import { useT, useLang, langLabels, Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { NotificationBell } from "@/components/notification-bell";
import type { Notification } from "@/db/schema";

const groups: { label: string; items: { href: string; key: string; icon: typeof Home }[] }[] = [
  { label: "", items: [
    { href: "/", key: "nav.home", icon: Home },
    { href: "/search", key: "nav.search", icon: Search },
  ]},
  { label: "nav.groups.intel", items: [
    { href: "/companies", key: "nav.companies", icon: Building2 },
    { href: "/industries", key: "nav.industries", icon: Factory },
    { href: "/cities", key: "nav.cities", icon: MapPin },
    { href: "/supply-chain", key: "nav.supply", icon: Truck },
    { href: "/policy", key: "nav.policy", icon: ScrollText },
    { href: "/opportunities", key: "nav.opportunities", icon: Briefcase },
  ]},
  { label: "nav.groups.ai", items: [
    { href: "/playbooks", key: "nav.playbooks", icon: BookOpen },
    { href: "/graph", key: "nav.graph", icon: Network },
    { href: "/compare", key: "nav.compare", icon: GitCompare },
    { href: "/consultant", key: "nav.consultant", icon: MessageSquare },
    { href: "/reports", key: "nav.reports", icon: FileText },
  ]},
  { label: "nav.groups.collab", items: [
    { href: "/workspace", key: "nav.workspace", icon: Users },
  ]},
];

type Account = { name: string; email: string; isAdmin?: boolean } | null;

export function Shell({ children, account, logout, notifications = [], unread = 0 }: {
  children: React.ReactNode; account?: Account; logout?: () => Promise<void>;
  notifications?: Notification[]; unread?: number;
}) {
  const t = useT();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-surface transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">中</div>
          <div>
            <div className="text-sm font-bold leading-tight">{t("brand")}</div>
            <div className="text-[10px] text-muted">{t("brand.full")}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-4 overflow-y-auto p-3" style={{ height: "calc(100vh - 4rem)" }}>
          {groups.map((g, gi) => (
            <div key={gi}>
              {g.label && <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">{t(g.label)}</div>}
              {g.items.map((it) => {
                const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-background hover:text-foreground"}`}
                  >
                    <Icon className="h-4 w-4" /> {t(it.key)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen((o) => !o)} menuOpen={open} account={account} logout={logout} notifications={notifications} unread={unread} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function Topbar({ onMenu, menuOpen, account, logout, notifications = [], unread = 0 }: {
  onMenu: () => void; menuOpen: boolean; account?: Account; logout?: () => Promise<void>;
  notifications?: Notification[]; unread?: number;
}) {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/80 px-5 backdrop-blur lg:px-8">
      <button className="lg:hidden" onClick={onMenu}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      <div className="hidden text-sm text-muted lg:block">AI 驱动的企业级中国市场进入与战略咨询操作系统</div>
      <div className="flex items-center gap-2">
        {account && <NotificationBell notifications={notifications} unread={unread} />}
        {account ? (
          <div className="relative">
            <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-background">
              <User className="h-4 w-4" /> <span className="max-w-[120px] truncate">{account.name}</span>
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-lg border bg-surface p-1 shadow-lg">
                <div className="border-b px-3 py-2 text-xs text-muted">{account.email}</div>
                <Link href="/me" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-background"><Star className="h-4 w-4" /> 我的空间</Link>
                {account.isAdmin && (
                  <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-background"><Shield className="h-4 w-4" /> 管理后台</Link>
                )}
                <form action={logout}>
                  <button type="submit" className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm text-red-500 hover:bg-background"><LogOut className="h-4 w-4" /> 退出登录</button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">登录</Link>
        )}
        <div className="relative">
          <button onClick={() => setLangOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-background">
            <Globe className="h-4 w-4" /> {langLabels[lang]}
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-lg border bg-surface p-1 shadow-lg">
              {(Object.keys(langLabels) as Lang[]).map((l) => (
                <button key={l} onClick={() => { setLang(l); setLangOpen(false); }} className={`block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-background ${l === lang ? "font-medium text-primary" : ""}`}>
                  {langLabels[l]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={toggle} className="rounded-lg border p-2 hover:bg-background">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
