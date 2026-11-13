import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Mobile-first frame: full width on phones, capped at 480px and centred on larger screens. */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto min-h-[var(--app-h)] w-full max-w-[480px] bg-surface shadow-[0_0_0_1px_var(--color-border)]", className)}>
      {children}
    </div>
  );
}

/** Standard body padding under a GradientHeader. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("space-y-6 px-5 pt-2 pb-10", className)}>{children}</main>;
}
