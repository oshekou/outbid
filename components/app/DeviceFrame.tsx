"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { BatteryFull, SignalHigh, Wifi } from "lucide-react";
import { Logo, QRCode } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * On a computer, shows the app inside a phone so it scrolls and feels like the real thing.
 * On a phone, every wrapper here is a plain block and the app fills the screen.
 * The switch is pure CSS (see `.device-*` in globals.css), so there's no flash on load.
 *
 * `.device-screen` has a transform, which makes it the containing block for
 * `position: fixed` children: the tab bar, toasts and bottom sheets stay inside the phone.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  return (
    <div className="device-stage">
      <aside className="device-aside" aria-label="About this preview">
        <Logo variant="color" width={180} />
        <p className="mt-8 font-display text-[2.4rem] leading-[1.05] font-extrabold tracking-[-0.04em] text-navy-900 italic">
          Made for <span className="text-teal-500">phones.</span>
        </p>
        <p className="mt-3 max-w-[30ch] text-lg leading-snug text-ink-500">
          You&apos;re looking at the Outbid app on a phone. Scroll inside it, tap around, or scan to open this screen on yours.
        </p>
        <Suspense fallback={null}>
          <OpenOnPhone />
        </Suspense>
        <nav className="mt-6 flex gap-5 font-display font-bold" aria-label="Preview shortcuts">
          <Link href="/demo" className="text-blue-600 hover:underline">
            Demo story
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </nav>
      </aside>

      <div className="device">
        <div className="device-screen">
          <div className={cn("device-statusbar", scrolled && "device-statusbar--solid")} aria-hidden="true">
            <span className="w-14 text-center">9:41</span>
            <span className="device-island" />
            <span className="flex w-14 items-center justify-center gap-1">
              <SignalHigh className="size-4" strokeWidth={2.5} />
              <Wifi className="size-4" strokeWidth={2.5} />
              <BatteryFull className="size-5" strokeWidth={2} />
            </span>
          </div>
          <Suspense fallback={null}>
            <ScrollReset />
          </Suspense>
          <div
            className="device-scroll"
            data-app-scroll
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 24)}
          >
            {children}
          </div>
          <div className="device-home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** New screen: start at the top, like an app. (The scroll event clears the solid status bar.) */
function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector<HTMLElement>("[data-app-scroll]")?.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** QR code for the screen currently showing in the phone. */
function OpenOnPhone() {
  const pathname = usePathname();
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  if (!origin) return null;
  return (
    <div className="mt-6 inline-flex items-center gap-4 rounded-card border border-border bg-card p-4">
      <QRCode value={`${origin}${pathname}`} size={104} label="QR code to open this screen on your phone" />
      <p className="max-w-[16ch] text-sm leading-snug text-ink-500">Point your phone camera here to open this exact screen.</p>
    </div>
  );
}

/** Scroll the app back to the top, whether it's framed or full-screen. */
export function scrollAppToTop() {
  document.querySelector<HTMLElement>("[data-app-scroll]")?.scrollTo({ top: 0 });
  window.scrollTo({ top: 0 });
}
