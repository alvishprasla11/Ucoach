"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";
import { LogOut, X, CircleCheck, TriangleAlert } from "./icons";
import { clearSession, useSession, type SessionUser } from "../lib/session";

/** Redirects to /login unless a user of the right type is signed in. */
export function useRequireUser(type: SessionUser["type"]) {
  const router = useRouter();
  const { user, ready } = useSession();
  const ok = !!user && user.type === type;
  useEffect(() => {
    if (ready && !ok) router.replace("/login");
  }, [ready, ok, router]);
  return ok ? user : null;
}

export function DashboardShell({
  user, roleLabel, children,
}: { user: SessionUser; roleLabel: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted">{roleLabel}</p>
            </div>
            <button
              onClick={() => { clearSession(); router.push("/"); }}
              className="btn btn-ghost !px-3 !py-2 text-sm"
              aria-label="Log out"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}

const TONES = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-gold/30 text-ink",
  red: "bg-red/10 text-red-deep",
  grey: "bg-paper-2 text-muted",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-5 py-4">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-paper-2 text-red">{icon}</div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-muted">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs, value, onChange,
}: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            value === t.id ? "border-red text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Chips<T extends string>({
  options, value, onChange, label,
}: { options: T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            value === o ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] rounded-2xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/50"
    >
      {open && (
        <div className="flex max-h-[calc(100vh-2rem)] flex-col">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-paper-2"><X size={20} /></button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export type Toast = { kind: "ok" | "error"; text: string } | null;

export function useToast() {
  const [toast, setToast] = useState<Toast>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  return { toast, show: (kind: "ok" | "error", text: string) => setToast({ kind, text }) };
}

export function ToastView({ toast }: { toast: Toast }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl enter ${
        toast.kind === "ok" ? "bg-ink" : "bg-red"
      }`}
    >
      {toast.kind === "ok" ? <CircleCheck size={18} /> : <TriangleAlert size={18} />}
      {toast.text}
    </div>
  );
}

export const LEVELS = ["Elementary (K-6)", "Middle School (7-9)", "High School (10-12)"] as const;
export const SPORTS = ["Basketball", "Football", "Flag Football", "Girls Basketball", "Other"] as const;

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
  return data as T;
}
