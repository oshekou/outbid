import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeadlineProps = {
  children: ReactNode;
  /** The highlighted word(s), rendered in lime after the main text. */
  highlight?: ReactNode;
  /** Put the highlight on its own line ("Donate one thing. / Get seen."). */
  breakBeforeHighlight?: boolean;
  as?: "h1" | "h2";
  className?: string;
};

/** Heavy italic headline with the last word in lime: "Pick your *side.*" */
export function Headline({
  children,
  highlight,
  breakBeforeHighlight,
  as: Tag = "h1",
  className,
}: HeadlineProps) {
  return (
    <Tag
      className={cn(
        "font-display text-[2.2rem] leading-[1.05] font-extrabold italic tracking-[-0.04em] text-white",
        className,
      )}
    >
      {children}
      {highlight ? (
        <>
          {breakBeforeHighlight ? <br /> : " "}
          <span className="text-lime-400">{highlight}</span>
        </>
      ) : null}
    </Tag>
  );
}
