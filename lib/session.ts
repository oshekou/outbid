"use client";

/**
 * Who is using this device, for the Phase 1 demo.
 * Phase 2 replaces this with Supabase auth (anonymous sessions for students,
 * phone OTP for bidders, magic link for organizers). Stored in localStorage.
 */

import { useSyncExternalStore } from "react";

export type Role = "organizer" | "student" | "business" | "bidder";

export type Viewer = {
  role: Role | null;
  studentId: string | null;
  bidderId: string | null;
  businessToken: string | null;
};

const KEY = "outbid:viewer:v1";
const EMPTY: Viewer = { role: null, studentId: null, bidderId: null, businessToken: null };

let cache: Viewer | null = null;
let raw: string | null = null;
const listeners = new Set<() => void>();

function read(): Viewer {
  if (typeof window === "undefined") return EMPTY;
  let next: string | null = null;
  try {
    next = window.localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  if (cache && next === raw) return cache;
  raw = next;
  try {
    cache = next ? { ...EMPTY, ...(JSON.parse(next) as Partial<Viewer>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export function getViewer(): Viewer {
  return read();
}

export function setViewer(patch: Partial<Viewer>) {
  const next = { ...read(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: keep it in memory for this tab */
  }
  cache = next;
  raw = JSON.stringify(next);
  listeners.forEach((l) => l());
}

export function clearViewer() {
  setViewer(EMPTY);
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** The current viewer; re-renders when it changes (in this tab or another). */
export function useViewer(): Viewer {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
