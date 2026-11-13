import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** "white" for gradient headers, "color" for light backgrounds. */
  variant?: "white" | "color";
  /** Rendered width in px; height follows the logo's aspect ratio. */
  width?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT = 264 / 820;

export function Logo({ variant = "white", width = 128, className, priority }: LogoProps) {
  return (
    <Image
      src={variant === "white" ? "/brand/logo-white.png" : "/brand/logo-color.png"}
      alt="Outbid, high school silent auctions"
      width={width}
      height={Math.round(width * ASPECT)}
      className={cn("h-auto select-none", className)}
      priority={priority}
    />
  );
}
