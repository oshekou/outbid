/** "$140" from 14000 cents. Whole dollars unless there are cents. */
export function money(cents: number | null | undefined) {
  if (cents == null) return "—";
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: cents % 100 ? 2 : 0, minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
}

/** 4100 → "4.1k", 430 → "430". */
export function compact(n: number) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
}

/** "2 min ago", "3 hr ago", "2 days ago". */
export function timeAgo(iso: string, now: Date = new Date()) {
  const s = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Countdown chip text: "6d 4h left", "3h 12m left", "Closed". */
export function timeLeft(closesAt: string, now: Date = new Date()) {
  const ms = new Date(closesAt).getTime() - now.getTime();
  if (ms <= 0) return "Closed";
  const m = Math.floor(ms / 60_000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  return `${h}h ${m % 60}m left`;
}

/** plural(1, "item") → "1 item", plural(3, "item") → "3 items", plural(2, "person", "people") → "2 people". */
export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** "Redwood Slice Co." + "." → no doubled period. */
export function sentence(text: string) {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}
