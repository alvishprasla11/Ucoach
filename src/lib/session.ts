"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface SessionUser {
  type: "student" | "school";
  name: string;
  email: string;
  ucid?: string;
  contactName?: string;
}

const KEY = "dinocoach_user";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("dinocoach-session", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("dinocoach-session", cb);
  };
};
const noop = () => () => {};

export function useSession() {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(KEY), () => null);
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const user = useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }, [raw]);
  return { user, ready };
}

export function saveSession(patch: Partial<SessionUser>) {
  const cur = localStorage.getItem(KEY);
  if (!cur) return;
  localStorage.setItem(KEY, JSON.stringify({ ...JSON.parse(cur), ...patch }));
  window.dispatchEvent(new Event("dinocoach-session"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
