import { cn } from "@/lib/cn";

/**
 * Faint school-mascot watermark for gradient headers.
 * A simple stylised bull head; swap for the school's real mascot art later.
 */
export function BullWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 180"
      aria-hidden="true"
      className={cn("pointer-events-none absolute text-green-500/30", className)}
      fill="currentColor"
    >
      {/* horns */}
      <path d="M38 20c-18 16-22 44-4 60 10 9 26 10 38 6l-6-16c-8 2-17 0-22-6-8-10-6-28-6-44z" />
      <path d="M162 20c18 16 22 44 4 60-10 9-26 10-38 6l6-16c8 2 17 0 22-6 8-10 6-28 6-44z" />
      {/* brow / hat brim */}
      <path d="M30 76c20-14 120-14 140 0-6 12-30 18-70 18s-64-6-70-18z" />
      {/* head */}
      <path d="M58 92h84c-2 26-10 48-22 62-6 8-14 12-20 12s-14-4-20-12c-12-14-20-36-22-62z" opacity=".85" />
      {/* eyes and nostrils cut out */}
      <path
        d="M74 110l18 8-4 6-16-6zM126 110l-18 8 4 6 16-6zM88 150a5 5 0 1 0 0.1 0zM112 150a5 5 0 1 0 0.1 0z"
        fill="#061c43"
        opacity=".35"
      />
    </svg>
  );
}
