import { cn } from "@/lib/cn";

export type AvatarTone = "lime" | "sky" | "sand" | "gradient" | "navy";

const tones: Record<AvatarTone, string> = {
  lime: "bg-lime-400/35 text-navy-900",
  sky: "bg-sky-50 text-navy-900",
  sand: "bg-[#FBEFC8] text-navy-900",
  gradient: "bg-gradient-to-br from-lime-400 to-green-500 text-navy-900",
  navy: "bg-navy-900 text-white",
};

/** "Olivia S." → "OS", "Coach Daniels" → "CD". */
export function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const cycle: AvatarTone[] = ["lime", "sky", "sand"];

/** Pick a stable tone from a name so the same person always gets the same colour. */
export function toneFor(name: string): AvatarTone {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return cycle[h % cycle.length]!;
}

export function Avatar({
  name,
  tone,
  size = "md",
  className,
}: {
  name: string;
  tone?: AvatarTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-extrabold tracking-[-0.02em]",
        size === "sm" && "size-9 text-sm",
        size === "md" && "size-12 text-base",
        size === "lg" && "size-16 text-xl",
        tones[tone ?? toneFor(name)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
