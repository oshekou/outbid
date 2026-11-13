"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipTone = "default" | "accent";

const chipBase =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-[0.92rem] font-bold whitespace-nowrap transition " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

/** Pill chip. Selected = navy/white, unselected = light grey, accent = lime-50/green. */
export function Chip({
  selected,
  tone = "default",
  className,
  ...props
}: ComponentProps<"button"> & { selected?: boolean; tone?: ChipTone }) {
  return (
    <button
      type="button"
      className={cn(
        chipBase,
        selected ? "bg-navy-900 text-white" : tone === "accent" ? "bg-lime-50 text-green-700" : "bg-chip text-navy-800 hover:bg-border",
        className,
      )}
      {...props}
    />
  );
}

/** Non-interactive pill, e.g. the "6d 4h left" countdown or "#1 of 5". */
export function Pill({
  children,
  tone = "accent",
  className,
}: {
  children: ReactNode;
  tone?: ChipTone | "navy" | "white";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[0.92rem] font-bold whitespace-nowrap",
        tone === "accent" && "bg-lime-50 text-green-700",
        tone === "default" && "bg-chip text-navy-800",
        tone === "navy" && "bg-navy-900 text-white",
        tone === "white" && "bg-white text-navy-900",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type ChipOption<T extends string> = { value: T; label: ReactNode };

/**
 * A row of mutually exclusive chips (tabs or quick-bid amounts).
 * Renders as a radio group so screen readers announce the selection.
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  layout = "scroll",
  trailing,
  className,
}: {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  /** "scroll" = left-aligned row, "fill" = equal-width cells (quick bids). */
  layout?: "scroll" | "fill";
  /** Extra non-option content at the end (e.g. a countdown pill). */
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        layout === "fill"
          ? "grid auto-cols-fr grid-flow-col gap-2.5"
          : "-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]",
        className,
      )}
    >
      {options.map((o) => (
        <Chip
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={layout === "fill" ? "w-full px-2" : undefined}
        >
          {o.label}
        </Chip>
      ))}
      {trailing}
    </div>
  );
}
