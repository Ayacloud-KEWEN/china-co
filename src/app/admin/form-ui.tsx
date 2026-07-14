"use client";

import { ReactNode } from "react";

const inputCls = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function Field({ label, name, defaultValue = "", type = "text", required, placeholder, hint }: {
  label: string; name: string; defaultValue?: string | number; type?: string; required?: boolean; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}{required && <span className="text-red-500"> *</span>}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder} className={inputCls} />
      {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function Area({ label, name, defaultValue = "", rows = 3, placeholder, hint }: {
  label: string; name: string; defaultValue?: string; rows?: number; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} placeholder={placeholder} className={`${inputCls} resize-y`} />
      {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function Select({ label, name, options, defaultValue, required }: {
  label: string; name: string; options: string[]; defaultValue?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}{required && <span className="text-red-500"> *</span>}</span>
      <select name={name} defaultValue={defaultValue ?? options[0]} className={inputCls}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function I18nFields({ label, name, zh, en, fr }: { label: string; name: string; zh?: string; en?: string; fr?: string }) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-muted">{label}（三语）</span>
      <Area label="中文" name={`${name}_zh`} defaultValue={zh ?? ""} rows={2} />
      <Area label="English" name={`${name}_en`} defaultValue={en ?? ""} rows={2} />
      <Area label="Français" name={`${name}_fr`} defaultValue={fr ?? ""} rows={2} />
    </div>
  );
}
