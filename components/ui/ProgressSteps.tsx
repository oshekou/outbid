import { cn } from "@/lib/cn";

/** Segmented step bar for the organizer setup ("Step 2 of 3"). */
export function ProgressSteps({
  total,
  current,
  className,
}: {
  total: number;
  /** 1-based step the user is on; steps up to and including it are lit. */
  current: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
      className={cn("flex gap-3", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn("h-2 flex-1 rounded-full", i < current ? "bg-lime-400" : "bg-white/35")}
        />
      ))}
    </div>
  );
}

/** Horizontal progress bar used on leaderboard rows. `value` is 0..1. */
export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-white/15", className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <div className="bg-bar-gradient h-full rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}
