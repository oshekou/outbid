"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumn, Tag, UsersRound } from "lucide-react";
import { cn } from "@/lib/cn";

/** Bottom tab bar for student and bidder views: Items, Leaderboard, Me. */
export function TabBar({ auctionSlug, active }: { auctionSlug: string; active?: "items" | "leaderboard" | "me" }) {
  const pathname = usePathname();
  const base = `/a/${auctionSlug}`;
  const tabs = [
    { key: "items", label: "Items", href: base, icon: Tag },
    { key: "leaderboard", label: "Leaderboard", href: `${base}/leaderboard`, icon: ChartNoAxesColumn },
    { key: "me", label: "Me", href: `${base}/me`, icon: UsersRound },
  ] as const;

  const current =
    active ??
    (pathname.startsWith(`${base}/leaderboard`) ? "leaderboard" : pathname.startsWith(`${base}/me`) ? "me" : "items");

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-border bg-card/95 pb-[var(--safe-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-3">
        {tabs.map(({ key, label, href, icon: Icon }) => {
          const on = current === key;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-sm font-bold transition",
                  "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-600",
                  on ? "text-teal-500" : "text-ink-500 hover:text-navy-800",
                )}
              >
                <Icon className="size-6" strokeWidth={on ? 2.25 : 1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Spacer so page content isn't hidden behind the fixed TabBar. */
export function TabBarSpacer() {
  return <div className="h-24" aria-hidden="true" />;
}
