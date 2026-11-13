import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TileTone = "lime" | "mint" | "sky" | "navy" | "plain";

const tileTones: Record<TileTone, string> = {
  lime: "bg-lime-400/30 text-green-700",
  mint: "bg-mint-50 text-teal-500",
  sky: "bg-sky-50 text-blue-600",
  navy: "bg-navy-900 text-white",
  plain: "bg-chip text-navy-800",
};

/** Rounded square holding an icon (charity results, squads, "What you get"). */
export function IconTile({
  children,
  tone = "lime",
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: TileTone;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl",
        size === "md" ? "size-12 [&>svg]:size-6" : "size-10 [&>svg]:size-5",
        tileTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type ListRowProps = {
  /** IconTile, Avatar or rank number on the left. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right side: a meta line, amount, check mark or button. */
  trailing?: ReactNode;
  /** Middle-right muted text ("2 min ago"). */
  meta?: ReactNode;
  selected?: boolean;
  href?: string;
  onClick?: () => void;
  /** For selectable lists (charity results, squads). */
  role?: "radio" | "option";
  className?: string;
};

/** One row inside a ListCard. Becomes a link or button when given href/onClick. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  meta,
  selected,
  href,
  onClick,
  role,
  className,
}: ListRowProps) {
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[1.05rem] leading-tight font-bold tracking-[-0.01em] text-navy-900">
          {title}
        </div>
        {subtitle ? <div className="mt-0.5 line-clamp-2 text-[0.9rem] leading-snug text-ink-500">{subtitle}</div> : null}
      </div>
      {meta ? <div className="shrink-0 text-sm text-ink-500">{meta}</div> : null}
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  );
  const cls = cn(
    "flex w-full items-center gap-4 px-4 py-3.5 text-left transition",
    selected && "bg-lime-50",
    (href || onClick) && !selected && "hover:bg-surface",
    (href || onClick) &&
      "focus-visible:relative focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-600",
    className,
  );
  return (
    <li>
      {href ? (
        <Link href={href} className={cls}>
          {body}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cls}
          role={role}
          aria-checked={role === "radio" ? !!selected : undefined}
          aria-selected={role === "option" ? !!selected : undefined}
        >
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}
