import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type CommonProps = {
  children: ReactNode;
  /** Icon before the label (e.g. Share, Copy). */
  icon?: ReactNode;
  /** Trailing arrow; on by default for primary buttons. */
  arrow?: boolean;
  /** Replace the trailing arrow with another icon (e.g. a check). */
  trailingIcon?: ReactNode;
  className?: string;
};

type AsButton = CommonProps & Omit<ComponentProps<"button">, "children" | "className"> & { href?: undefined };
type AsLink = CommonProps & { href: string; onClick?: () => void; "aria-label"?: string };

type ButtonProps = AsButton | AsLink;

function Inner({ children, icon, arrow, trailingIcon }: CommonProps) {
  return (
    <>
      {icon ? <span className="shrink-0 [&>svg]:size-5">{icon}</span> : null}
      <span className="truncate">{children}</span>
      {trailingIcon ? (
        <span className="shrink-0 [&>svg]:size-6">{trailingIcon}</span>
      ) : arrow ? (
        <ArrowRight className="size-6 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      ) : null}
    </>
  );
}

function render(props: ButtonProps, base: string) {
  const { children, icon, arrow, trailingIcon, className } = props;
  const inner = <Inner {...{ children, icon, arrow, trailingIcon }} />;
  const cls = cn(base, className);
  if (props.href !== undefined) {
    return (
      <Link href={props.href} onClick={props.onClick} aria-label={props["aria-label"]} className={cls}>
        {inner}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _c, icon: _i, arrow: _a, trailingIcon: _t, className: _cl, type, ...rest } = props as AsButton;
  return (
    <button type={type ?? "button"} className={cls} {...rest}>
      {inner}
    </button>
  );
}

const shared =
  "inline-flex w-full items-center justify-center gap-3 rounded-full font-display font-bold tracking-[-0.02em] transition " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 " +
  "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]";

/**
 * Full-width 56px pill. `lime` = solid lime with navy text ("Bid $160"),
 * `gradient` = blue→green with white text ("Next: Set Up Teams").
 */
export function PrimaryButton({
  variant = "lime",
  arrow = true,
  ...props
}: ButtonProps & { variant?: "lime" | "gradient" }) {
  return render(
    { ...props, arrow } as ButtonProps,
    cn(
      shared,
      "h-14 px-6 text-xl",
      variant === "lime"
        ? "bg-lime-400 text-navy-900 hover:brightness-105"
        : "bg-button-gradient text-white hover:brightness-110",
    ),
  );
}

/** `outline` = white pill with border, `navy` = solid navy pill. */
export function SecondaryButton({
  variant = "outline",
  arrow = false,
  size = "md",
  ...props
}: ButtonProps & { variant?: "outline" | "navy" | "lime"; size?: "md" | "sm" }) {
  return render(
    { ...props, arrow } as ButtonProps,
    cn(
      shared,
      size === "md" ? "h-13 px-4 text-base" : "h-10 px-4 text-sm",
      variant === "outline" && "border-[1.5px] border-border bg-card text-navy-900 hover:bg-chip",
      variant === "navy" && "bg-navy-900 text-white hover:bg-navy-800",
      variant === "lime" && "bg-lime-400 text-navy-900 hover:brightness-105",
    ),
  );
}
