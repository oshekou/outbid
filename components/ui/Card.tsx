import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** White card, 1px border, 20px radius, no heavy shadow. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-card border border-border bg-card", className)} {...props} />;
}

/** A card holding a stack of ListRows separated by hairlines. */
export function ListCard({ className, children, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn("divide-y divide-border overflow-hidden rounded-card border border-border bg-card", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

/** Small uppercase letter-spaced navy label: "YOUR NAME", "BID HISTORY". */
export function SectionLabel({
  children,
  aside,
  className,
  as: Tag = "h2",
  htmlFor,
}: {
  children: ReactNode;
  /** Right-aligned note, e.g. "optional". */
  aside?: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "label" | "div";
  htmlFor?: string;
}) {
  const label =
    Tag === "label" ? (
      <label htmlFor={htmlFor} className="section-label text-navy-900">
        {children}
      </label>
    ) : (
      <Tag className="section-label text-navy-900">{children}</Tag>
    );
  return (
    <div className={cn("mb-2.5 flex items-baseline justify-between gap-3", className)}>
      {label}
      {aside ? <span className="text-sm text-ink-500">{aside}</span> : null}
    </div>
  );
}

/** Big blue number over a small grey label. Usually three across. */
export function StatTile({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 px-3.5 py-3", className)}>
      <div className="font-display text-[1.7rem] leading-tight font-extrabold tracking-[-0.03em] text-blue-600">
        {value}
      </div>
      <div className="truncate text-sm text-ink-500">{label}</div>
    </Card>
  );
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-3 gap-2.5", className)}>{children}</div>;
}
