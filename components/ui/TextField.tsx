"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionLabel } from "./Card";

type FieldShellProps = {
  label?: ReactNode;
  /** Right-aligned note next to the label ("optional"). */
  aside?: ReactNode;
  /** Small grey help text under the input ("Searching 1M+ charities on Every.org"). */
  hint?: ReactNode;
  error?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

const boxBase =
  "flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-border bg-card px-4 text-[1.05rem] text-navy-900 transition " +
  "focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/15";

function Shell({
  id,
  label,
  aside,
  hint,
  error,
  className,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      {label ? (
        <SectionLabel as="label" htmlFor={id} aside={aside}>
          {label}
        </SectionLabel>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Labelled single-line input with an optional leading icon. */
export function TextField({
  label,
  aside,
  hint,
  error,
  icon,
  className,
  id: idProp,
  ...input
}: FieldShellProps & Omit<ComponentProps<"input">, "className">) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <Shell {...{ id, label, aside, hint, error, className }}>
      <div className={cn(boxBase, "h-14", error && "border-red-600")}>
        {icon ? <span className="shrink-0 text-green-500 [&>svg]:size-6">{icon}</span> : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-500/70"
          {...input}
        />
      </div>
    </Shell>
  );
}

/** Labelled multi-line input ("One line for the post", "Caption"). */
export function TextArea({
  label,
  aside,
  hint,
  error,
  className,
  id: idProp,
  rows = 2,
  ...textarea
}: Omit<FieldShellProps, "icon"> & Omit<ComponentProps<"textarea">, "className">) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <Shell {...{ id, label, aside, hint, error, className }}>
      <div className={cn(boxBase, "py-3.5", error && "border-red-600")}>
        <textarea
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="w-full resize-none bg-transparent text-[1.05rem] leading-snug font-medium outline-none placeholder:text-ink-500/70"
          {...textarea}
        />
      </div>
    </Shell>
  );
}
