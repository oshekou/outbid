"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type Toast = { id: number; message: ReactNode; tone: "success" | "error" };
type ToastFn = (message: ReactNode, tone?: Toast["tone"]) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Small confirmation pop-ups at the top of the screen ("Bid placed", "Link copied"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback<ToastFn>((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex max-w-[480px] flex-col gap-2 px-4 pt-[max(0.75rem,var(--safe-top))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "animate-toast-in flex items-center gap-3 rounded-2xl px-4 py-3 font-display font-bold shadow-lg",
              t.tone === "success" ? "bg-navy-900 text-white" : "bg-red-700 text-white",
            )}
          >
            {t.tone === "success" ? (
              <CircleCheck className="size-5 shrink-0 text-lime-400" aria-hidden="true" />
            ) : (
              <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
            )}
            <span className="min-w-0">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
