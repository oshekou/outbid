/**
 * Phase 1 mock store: the whole DB in memory, mirrored to localStorage in the browser
 * so a demo survives page reloads. Phase 2 deletes this file; only lib/data/index.ts
 * changes to call Supabase instead.
 */

import { buildSeed } from "../mock/seed";
import type { DB } from "../types";

const STORAGE_KEY = "outbid:mock-db:v1";

let db: DB | null = null;
const listeners = new Set<() => void>();
let version = 0;

function load(): DB {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as DB;
    } catch {
      // Private mode or corrupted JSON: fall back to a fresh seed.
    }
  }
  return buildSeed();
}

function persist() {
  if (typeof window === "undefined" || !db) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked; the in-memory copy still works for this tab.
  }
}

/** Read-only access to the current DB. */
export function getDB(): DB {
  db ??= load();
  return db;
}

/** Apply a change, persist it, and notify subscribers. */
export function mutate<T>(fn: (db: DB) => T): T {
  const result = fn(getDB());
  version++;
  persist();
  listeners.forEach((l) => l());
  return result;
}

/** Wipe local changes and reload the seed (used by /demo "Reset demo"). */
export function resetDB(now: Date = new Date()) {
  db = buildSeed(now);
  version++;
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVersion() {
  return version;
}

// Keep tabs in sync: a bid in one tab shows up in another.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      db = JSON.parse(e.newValue) as DB;
      version++;
      listeners.forEach((l) => l());
    } catch {
      /* ignore */
    }
  });
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}-${rand}`;
}

/** Long random token for dashboard links and prize passes. */
export function newToken(prefix: string) {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
