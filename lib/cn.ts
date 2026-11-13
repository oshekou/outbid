import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom utilities so overrides resolve correctly.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-image": ["bg-header-gradient", "bg-button-gradient", "bg-callout-gradient", "bg-bar-gradient"],
      "font-size": ["section-label"],
    },
  },
});

/** Join class names, skipping falsy values; later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
