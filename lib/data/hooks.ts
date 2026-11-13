"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getVersion, subscribe } from "./index";

/**
 * Run an async data function and re-run it whenever the mock store changes
 * (a bid here, or in another tab). Returns undefined while loading.
 *
 * Phase 2 keeps this signature but re-runs on Supabase realtime events instead.
 */
export function useData<T>(fn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const version = useSyncExternalStore(subscribe, getVersion, () => 0);
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    let live = true;
    fn().then((v) => {
      if (live) setValue(v);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps]);
  return value;
}
