"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { getAuction } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { PageShell } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Route params as plain strings. */
export function useRouteParams<T extends string>(): Record<T, string> {
  return useParams() as Record<T, string>;
}

/** Load the auction for the current /a/[auction] route. `null` = not found. */
export function useAuction(slug: string) {
  return useData(() => getAuction(slug), [slug]);
}

/** Every screen sits in a PageShell and eases in. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <PageShell className={cn("animate-screen-in", className)}>{children}</PageShell>;
}

/** Big navy money figure used in lists and bid rows. */
export function Amount({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-display text-xl font-extrabold tracking-[-0.03em] text-navy-900", className)}>
      {children}
    </span>
  );
}
