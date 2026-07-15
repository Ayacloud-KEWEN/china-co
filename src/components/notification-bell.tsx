"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import type { Notification } from "@/db/schema";

export function NotificationBell({ notifications, unread }: { notifications: Notification[]; unread: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-lg border p-2 hover:bg-background" title="通知">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-1 w-80 rounded-lg border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-semibold">通知{unread > 0 ? ` · ${unread} 条未读` : ""}</span>
              {unread > 0 && (
                <button onClick={() => markAllNotificationsRead()} className="flex items-center gap-1 text-xs text-accent hover:underline">
                  <Check className="h-3 w-3" /> 全部已读
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">暂无通知。到「我的空间」订阅关键词，有新政策时会在此提醒。</p>
              ) : (
                notifications.map((n) => {
                  const body = (
                    <div className={`border-b px-3 py-2.5 transition hover:bg-background ${n.read ? "" : "bg-accent/5"}`}
                      onClick={() => { if (!n.read) markNotificationRead(n.id); }}>
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm leading-snug">{n.title}</div>
                          {n.body && <div className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</div>}
                          <div className="mt-1 text-[10px] text-muted">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  );
                  return n.url
                    ? <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="block">{body}</a>
                    : <div key={n.id}>{body}</div>;
                })
              )}
            </div>
            <Link href="/me" onClick={() => setOpen(false)} className="block border-t px-3 py-2 text-center text-xs text-accent hover:underline">
              管理订阅 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
