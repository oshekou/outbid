import { createElement } from "react";
import { Coffee, Flower2, Guitar, Hamburger, Mountain, Pizza, Sailboat, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ItemArt as ArtKey } from "@/lib/types";

const ART: Record<ArtKey, { icon: LucideIcon; from: string; to: string }> = {
  pizza: { icon: Pizza, from: "#0E8479", to: "#84E81C" },
  burger: { icon: Hamburger, from: "#0767B3", to: "#1BAA85" },
  coffee: { icon: Coffee, from: "#092B57", to: "#0E8479" },
  climb: { icon: Mountain, from: "#0752B0", to: "#1BAA85" },
  guitar: { icon: Guitar, from: "#061C43", to: "#0767B3" },
  flower: { icon: Flower2, from: "#1BAA85", to: "#84E81C" },
  bowling: { icon: Trophy, from: "#092B57", to: "#1BAA85" },
  sail: { icon: Sailboat, from: "#0767B3", to: "#84E81C" },
};

export function artIcon(key: ArtKey): LucideIcon {
  return ART[key]?.icon ?? Pizza;
}

/** The outline icon for an item's category. */
export function ItemIcon({ art, className, strokeWidth }: { art: ArtKey; className?: string; strokeWidth?: number }) {
  return createElement(artIcon(art), { className, strokeWidth, "aria-hidden": true });
}

/**
 * Item photo. Uses the uploaded photo when there is one; otherwise a branded
 * gradient with a large outline icon, so items never look broken.
 */
export function ItemArt({
  art,
  photo,
  className,
  children,
  iconClassName,
}: {
  art: ArtKey;
  photo?: string | null;
  className?: string;
  /** Overlays: logo tile, badges. */
  children?: React.ReactNode;
  iconClassName?: string;
}) {
  const a = ART[art] ?? ART.pizza;
  const Icon = a.icon;
  return (
    <div
      className={cn("relative overflow-hidden rounded-card", className)}
      style={photo ? undefined : { backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-25"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0, transparent 45%)" }}
            aria-hidden="true"
          />
          <Icon
            className={cn("absolute -right-4 -bottom-6 size-40 text-white/25", iconClassName)}
            strokeWidth={1.25}
            aria-hidden="true"
          />
        </>
      )}
      {children}
    </div>
  );
}

/** White rounded logo tile. Shows the uploaded logo or a wordmark from the name. */
export function BusinessLogo({
  name,
  logo,
  size = "md",
  className,
}: {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const words = name.replace(/&/g, "").split(/\s+/).filter(Boolean);
  const main = words[0] ?? name;
  const rest = words.slice(1).join(" ");
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-center shadow-sm",
        size === "sm" && "size-12 rounded-xl p-1",
        size === "md" && "size-20 p-2",
        size === "lg" && "size-28 p-3",
        className,
      )}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={`${name} logo`} className="size-full object-contain" />
      ) : (
        <div aria-label={`${name} logo`} role="img" className="leading-none">
          <div
            className={cn(
              "font-display leading-none font-extrabold tracking-[-0.03em] break-all text-blue-600 uppercase",
              size === "sm" && "text-[0.55rem]",
              size === "md" && (main.length > 6 ? "text-[0.7rem]" : "text-sm"),
              size === "lg" && (main.length > 6 ? "text-base" : "text-xl"),
            )}
          >
            {main}
          </div>
          {rest && size !== "sm" ? (
            <div
              className={cn(
                "mt-1 rounded border border-teal-500 px-1 font-bold tracking-wider text-teal-500 uppercase",
                size === "md" ? "text-[0.45rem]" : "text-[0.6rem]",
              )}
            >
              {rest}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
