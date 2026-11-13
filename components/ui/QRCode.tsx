import QR from "qrcode";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A real, scannable QR code drawn as one SVG path.
 * Built synchronously from the `qrcode` matrix, so it renders the same on server and client.
 */
export function QRCode({
  value,
  size = 200,
  color = "#061C43",
  label,
  className,
}: {
  value: string;
  size?: number;
  color?: string;
  /** Accessible description; defaults to the encoded value. */
  label?: string;
  className?: string;
}) {
  const qr = QR.create(value, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const data = qr.modules.data;
  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (data[y * n + x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      width={size}
      height={size}
      role="img"
      aria-label={label ?? `QR code for ${value}`}
      shapeRendering="crispEdges"
      className={cn("block", className)}
    >
      <path d={d} fill={color} />
    </svg>
  );
}

/** QR inside a bordered white tile, with optional link text and a name pill under it (screen 04). */
export function QRCard({
  value,
  displayUrl,
  badge,
  size = 168,
  className,
}: {
  value: string;
  /** Short link shown under the code, e.g. "outbid.app/give/branson/olivia". */
  displayUrl?: string;
  /** Pill under the link, e.g. "Olivia S. · Class of 2027". */
  badge?: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="rounded-card border border-border bg-card p-5">
        <QRCode value={value} size={size} />
      </div>
      {displayUrl ? <p className="mt-3 text-[0.95rem] break-all text-blue-600">{displayUrl}</p> : null}
      {badge ? (
        <p className="mt-2.5 rounded-full bg-lime-50 px-4 py-1.5 font-display font-bold text-green-700">{badge}</p>
      ) : null}
    </div>
  );
}
