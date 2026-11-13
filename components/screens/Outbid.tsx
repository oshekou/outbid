"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, PartyPopper } from "lucide-react";
import { BusinessLogo, ItemArt, ItemIcon } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import { ChipGroup, IconTile, Logo, PageShell, PrimaryButton, Toggle } from "@/components/ui";
import { DataError, getBidder, getItemDetail, isAuctionOpen, lastBidBy, placeBid, quickBids } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { FEATURE_MAX_BID } from "@/lib/flags";
import { DEMO } from "@/lib/mock/seed";
import { money } from "@/lib/format";
import { useViewer } from "@/lib/session";
import { useRouteParams } from "./shared";

/** Screen 10: landing page from the "You've been outbid" text. */
export function Outbid() {
  const { auction: slug, item: itemId } = useRouteParams<"auction" | "item">();
  const viewer = useViewer();
  // The text link identifies the bidder in Phase 2; the demo falls back to Jamie.
  const bidderId = viewer.bidderId ?? DEMO.bidderId;
  const toast = useToast();
  const [choice, setChoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const detail = useData(() => getItemDetail(itemId), [itemId]);
  const mine = useData(() => lastBidBy(itemId, bidderId), [itemId, bidderId]);
  const leader = useData(
    async () => (detail?.item.leadingBidderId ? getBidder(detail.item.leadingBidderId) : null),
    [detail?.item.leadingBidderId],
  );

  if (detail === undefined || mine === undefined || leader === undefined) return <ScreenSkeleton />;
  if (!detail || detail.auction.slug !== slug) return <NotFound what="item" />;

  const { item, auction, business } = detail;
  const open = isAuctionOpen(auction) && item.status === "live";
  const youLead = item.leadingBidderId === bidderId;
  const quick = quickBids(item, auction);
  const selected = Number(choice ?? quick[0]);

  async function bid() {
    setBusy(true);
    try {
      await placeBid(item.id, bidderId, selected);
      toast(`You took it back at ${money(selected)}`);
      setChoice(null);
    } catch (e) {
      toast(e instanceof DataError ? e.message : "Something went wrong. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell className="bg-header-gradient animate-screen-in min-h-[var(--app-h)]">
      <main className="px-4 pt-[max(1.5rem,calc(var(--safe-top)+0.5rem))] pb-8 text-white">
        <Link href={`/a/${slug}`} aria-label="Outbid home" className="inline-block">
          <Logo width={120} />
        </Link>
        <div className="mt-3 text-center">
          {youLead ? (
            <PartyPopper className="mx-auto size-14 text-lime-400" aria-hidden="true" />
          ) : (
            <BellRing className="mx-auto size-14 text-[#FFC93C]" aria-hidden="true" />
          )}
          <h1 className="mt-3 font-display text-[2.3rem] leading-none font-extrabold tracking-[-0.04em] italic">
            {youLead ? (
              <>
                You&apos;re back <span className="text-lime-400">on top!</span>
              </>
            ) : (
              <>
                You&apos;ve been <span className="text-lime-400">outbid!</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-lg leading-snug">
            {youLead ? (
              <>
                Your {money(item.currentBidCents)} bid leads the{" "}
                <strong className="text-lime-400">
                  {business.name} {item.title.toLowerCase()}
                </strong>
                .
              </>
            ) : (
              <>
                {leader?.displayName ?? "Someone"} just bid {money(item.currentBidCents)} on the{" "}
                <strong className="text-lime-400">
                  {business.name} {item.title.toLowerCase()}
                </strong>
                . Tap to take it back!
              </>
            )}
          </p>
        </div>

        <div className="mt-6 rounded-[28px] bg-surface p-3 text-navy-900 shadow-2xl">
          <ItemArt art={item.artIcon} photo={item.photoPath} className="h-40 rounded-[20px]">
            <BusinessLogo name={business.name} logo={business.logoPath} size="lg" className="absolute top-3 left-3" />
          </ItemArt>
          <div className="space-y-4 px-2 pt-4 pb-2">
            <div className="flex items-center gap-3">
              <IconTile tone="mint">
                <ItemIcon art={item.artIcon} />
              </IconTile>
              <div className="min-w-0">
                <h2 className="font-display text-lg leading-tight font-extrabold tracking-[-0.02em]">
                  {item.title} at {business.name}
                </h2>
                <p className="text-sm text-ink-500">Donated by {business.name}</p>
              </div>
            </div>

            <dl className="divide-y divide-border rounded-card border border-border bg-card px-4">
              <Row label="Leading bid" value={money(item.currentBidCents)} />
              <Row label="Your last bid" value={mine ? money(mine.amountCents) : "—"} />
              {open && !youLead ? <Row label="Bid to take it back" value={money(quick[0])} accent /> : null}
            </dl>

            {open ? (
              <>
                <ChipGroup
                  label="Bid amount"
                  layout="fill"
                  value={String(selected)}
                  onChange={setChoice}
                  options={quick.map((q) => ({ value: String(q), label: money(q) }))}
                />
                <div className="rounded-card bg-chip/70 p-4">
                  <Toggle
                    label="Set a max and stop checking"
                    description={`We bid for you in ${money(auction.minIncrementCents)} steps up to your max.`}
                    checked={false}
                    disabled={!FEATURE_MAX_BID}
                    badge={FEATURE_MAX_BID ? undefined : "Coming soon"}
                  />
                </div>
                <PrimaryButton onClick={bid} disabled={busy}>
                  {youLead ? `Raise to ${money(selected)}` : `Bid ${money(selected)}`}
                </PrimaryButton>
              </>
            ) : (
              <p className="rounded-card bg-chip px-4 py-3 text-center text-ink-500">Bidding has closed on this item.</p>
            )}
            <Link href={`/a/${slug}/items/${item.id}`} className="block py-1 text-center text-sm font-bold text-blue-600">
              See the full item
            </Link>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={accent ? "font-display text-2xl font-extrabold text-blue-600" : "font-display text-xl font-extrabold"}>
        {value}
      </dd>
    </div>
  );
}
