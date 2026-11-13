"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** On/off switch ("Let students create squads", "Set a max and stop checking"). */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled,
  badge,
  className,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Small tag next to the label, e.g. "Coming soon". */
  badge?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-center gap-4", disabled && "opacity-70", className)}>
      {icon ? (
        <span className="shrink-0 text-green-500 [&>svg]:size-7" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="flex flex-wrap items-center gap-2 font-display text-[1.05rem] font-bold text-navy-900">
          {label}
          {badge ? (
            <span className="rounded-full bg-chip px-2.5 py-0.5 font-sans text-xs font-bold tracking-wide text-ink-500 uppercase">
              {badge}
            </span>
          ) : null}
        </label>
        {description ? (
          <p id={`${id}-desc`} className="mt-0.5 text-[0.95rem] text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full transition-colors",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          "disabled:cursor-not-allowed",
          checked ? "bg-[#0E9F5F]" : "bg-[#C9D3E0]",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-6",
          )}
        />
      </button>
    </div>
  );
}
