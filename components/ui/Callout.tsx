import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Soft info box. `success` = lime→mint gradient (screens 01, 03, 06),
 * `info` = pale blue-grey (screen 07's approval note).
 */
export function Callout({
  icon,
  title,
  children,
  tone = "success",
  iconTile,
  className,
}: {
  icon?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  tone?: "success" | "info";
  /** Put the icon on a lime tile (screen 06's credit line). */
  iconTile?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-card px-5 py-4",
        tone === "success" ? "bg-callout-gradient" : "bg-sky-50",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mt-0.5 shrink-0 text-teal-500 [&>svg]:size-7",
            iconTile && "grid size-11 place-items-center rounded-xl bg-lime-400/40 text-green-700 [&>svg]:size-6",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 text-[1.02rem] leading-snug text-ink-500">
        {title ? <p className="mb-1 font-display text-lg font-bold text-navy-900">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
