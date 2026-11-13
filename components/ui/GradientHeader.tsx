import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BullWatermark } from "./BullWatermark";
import { Logo } from "./Logo";

type GradientHeaderProps = {
  /** Small caps label top-left: "BRANSON FALL AUCTION" or "Step 1 of 3". */
  eyebrow?: ReactNode;
  /** Render the eyebrow as uppercase letter-spaced text (default) or plain bold. */
  eyebrowStyle?: "caps" | "plain";
  /** Replaces the logo on the right, e.g. a "Business Redemption" pill. */
  right?: ReactNode;
  /** Show a thin divider between eyebrow and logo (screens 05, 09). */
  divider?: boolean;
  /** Content under the eyebrow row: progress, headline, subtitle. */
  children?: ReactNode;
  watermark?: boolean;
  className?: string;
};

/**
 * Navy → blue → green header with a shallow curved bottom edge.
 * Used at the top of nearly every screen.
 */
export function GradientHeader({
  eyebrow,
  eyebrowStyle = "caps",
  right,
  divider,
  children,
  watermark,
  className,
}: GradientHeaderProps) {
  return (
    <header className={cn("bg-header-gradient relative overflow-hidden text-white", className)}>
      {watermark ? <BullWatermark className="-right-6 top-14 w-56" /> : null}
      <div className="relative px-5 pt-6 pb-14">
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn(
              "min-w-0 flex-1",
              eyebrowStyle === "caps"
                ? "text-[0.8rem] leading-snug font-bold tracking-[0.14em] uppercase"
                : "font-display text-base font-bold",
            )}
          >
            {eyebrow}
          </div>
          {divider ? <div className="h-12 w-px bg-white/40" aria-hidden="true" /> : null}
          <div className="shrink-0">{right ?? <Logo width={124} priority />}</div>
        </div>
        {children ? <div className="mt-5 space-y-3">{children}</div> : null}
      </div>
      <HeaderCurve />
    </header>
  );
}

export function HeaderSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("max-w-[34ch] text-[1.05rem] leading-snug text-white/95", className)}>{children}</p>;
}

/** The surface-coloured arc that forms the header's curved bottom. */
function HeaderCurve() {
  return (
    <svg
      className="absolute inset-x-0 -bottom-px block h-8 w-full"
      viewBox="0 0 390 32"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 32V22C120 2 280 0 390 14V32Z" fill="var(--color-surface)" />
    </svg>
  );
}
