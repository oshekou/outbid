"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Megaphone } from "lucide-react";
import { BusinessLogo, ItemArt } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Avatar,
  Callout,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  ListCard,
  ListRow,
  PageBody,
  PrimaryButton,
  SectionLabel,
  StatRow,
  StatTile,
  TabBar,
  TabBarSpacer,
  TextField,
} from "@/components/ui";
import {
  DataError,
  getItemDetail,
  isAuctionOpen,
  listBids,
  minimumNextBid,
  placeBid,
  quickBids,
  recordItemView,
} from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money, timeAgo, timeLeft } from "@/lib/format";
import { useViewer } from "@/lib/session";
import { BidderSignIn } from "./BidderSignIn";
import { Amount, Screen, useRouteParams } from "./shared";

/** Screen 09: item detail with bid history and quick bids. */
export function ItemDetail() {
  const { auction: slug, item: itemId } = useRouteParams<"auction" | "item">();
  const detail = useData(() => getItemDetail(itemId), [itemId]);
  const bids = useData(() => listBids(itemId), [itemId]);
  const viewer = useViewer();
  const toast = useToast();
  const [choice, setChoice] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const [signIn, setSignIn] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bump, setBump] = useState(0);
  const lastBid = useRef<number | null>(null);

  // Count the view once, tagged by where it came from (?src=post-…, ?src=qr).
  useEffect(() => {
    const src = new URLSearchParams(window.location.search).get("src") ?? "";
    recordItemView(itemId, src.startsWith("post") ? "post" : src === "qr" ? "qr" : "direct");
  }, [itemId]);

  // Pulse the current bid when someone else bids while you're watching.
  const current = detail?.item.currentBidCents ?? null;
  useEffect(() => {
    if (lastBid.current !== null && current !== lastBid.current) setBump((n) => n + 1);
    lastBid.current = current;
  }, [current]);

  if (detail === undefined || bids === undefined) return <ScreenSkeleton />;
  if (detail === null || detail.auction.slug !== slug) return <NotFound what="item" />;

  const { item, auction, business, student, team } = detail;
  const open = isAuctionOpen(auction) && item.status === "live";
  const quick = quickBids(item, auction);
  const min = minimumNextBid(item, auction);
  const selected = choice ?? String(quick[0]);
  const amount = selected === "other" ? Math.round(Number(other.replace(/[^\d.]/g, "")) * 100) : Number(selected);
  const leading = !!viewer.bidderId && item.leadingBidderId === viewer.bidderId;
  const visibleBids = showAll ? bids : bids.slice(0, 3);

  async function submit(bidderId: string) {
    if (!amount || amount < min) {
      toast(`Bid at least ${money(min)}`, "error");
      return;
    }
    setBusy(true);
    try {
      await placeBid(item.id, bidderId, amount);
      toast(`You're winning at ${money(amount)}`);
      setChoice(null);
      setOther("");
    } catch (e) {
      toast(e instanceof DataError ? e.message : "Something went wrong. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} divider back={`/a/${slug}`}>
        <Headline className="text-[2rem]" highlight={business.name} breakBeforeHighlight>
          {item.title} at
        </Headline>
        <HeaderSubtitle className="max-w-none">
          Donated by {business.name}
          {student ? (
            <>
              {" "}
              · Secured by {student.displayName}
              {team?.kind === "grade" ? `, ${team.name}` : ""}
            </>
          ) : null}
        </HeaderSubtitle>
      </GradientHeader>

      <PageBody className="space-y-5">
        <ItemArt art={item.artIcon} photo={item.photoPath} className="h-48">
          <BusinessLogo name={business.name} logo={business.logoPath} size="lg" className="absolute top-4 left-4" />
          <span className="absolute bottom-3 left-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-extrabold tracking-[0.18em] text-white uppercase">
            {open ? timeLeft(auction.closesAt) : item.status === "pending" ? "Awaiting approval" : "Bidding closed"}
          </span>
        </ItemArt>

        <p className="text-[1.05rem] leading-snug text-ink-500">
          {item.description} Valid for {item.validDays} days
          {item.uses > 1 ? `, ${item.uses} uses` : ""}.
        </p>

        <StatRow>
          <StatTile
            value={<span key={bump} className={bump ? "animate-bump inline-block" : undefined}>{money(item.currentBidCents ?? item.startingBidCents)}</span>}
            label={item.currentBidCents ? "Current bid" : "Starting bid"}
          />
          <StatTile value={item.bidCount} label={item.bidCount === 1 ? "Bid" : "Bids"} />
          <StatTile value={money(item.retailValueCents)} label="Retail value" />
        </StatRow>

        {leading ? (
          <Callout icon={<Crown />}>
            <strong className="text-navy-900">You&apos;re the leading bidder.</strong> We&apos;ll text you if someone outbids you.
          </Callout>
        ) : null}

        <section>
          <SectionLabel>Bid history</SectionLabel>
          {bids.length === 0 ? (
            <div className="rounded-card border border-dashed border-border px-5 py-8 text-center text-ink-500">
              No bids yet. Start it at {money(item.startingBidCents)}.
            </div>
          ) : (
            <>
              <ListCard>
                {visibleBids.map((b) => (
                  <ListRow
                    key={b.id}
                    leading={<Avatar name={b.bidderName} />}
                    title={b.bidderName}
                    subtitle={b.bidderId === viewer.bidderId ? `${b.bidderTown} · You` : b.bidderTown}
                    meta={timeAgo(b.createdAt)}
                    trailing={<Amount>{money(b.amountCents)}</Amount>}
                  />
                ))}
              </ListCard>
              {bids.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-2 w-full py-2 text-sm font-bold text-blue-600"
                >
                  {showAll ? "Show less" : `See all ${bids.length} bids`}
                </button>
              ) : null}
            </>
          )}
        </section>

        {student && viewer.studentId === student.id ? (
          <PrimaryButton href={`/a/${slug}/items/${item.id}/post`} variant="gradient" icon={<Megaphone />}>
            Make a post about this
          </PrimaryButton>
        ) : null}

        {open ? (
          <section className="space-y-4">
            <ChipGroup
              label="Bid amount"
              layout="fill"
              value={selected}
              onChange={setChoice}
              options={[...quick.map((q) => ({ value: String(q), label: money(q) })), { value: "other", label: "Other" }]}
            />
            {selected === "other" ? (
              <TextField
                label="Your bid"
                inputMode="decimal"
                placeholder={`${(min / 100).toFixed(0)} or more`}
                value={other}
                onChange={(e) => setOther(e.target.value)}
                hint={`Minimum ${money(min)}. Bids go up in ${money(auction.minIncrementCents)} steps.`}
                autoFocus
              />
            ) : null}
            <div className="space-y-2.5 pt-2">
              <PrimaryButton
                disabled={busy}
                onClick={() => (viewer.bidderId ? submit(viewer.bidderId) : setSignIn(true))}
              >
                {leading ? `Raise to ${money(amount || min)}` : `Bid ${money(amount || min)}`}
              </PrimaryButton>
              <p className="text-center text-sm text-ink-500">
                We text you if you&apos;re outbid. You only pay if you win, on Every.org.
              </p>
            </div>
          </section>
        ) : (
          <Callout tone="info">
            {item.status === "pending"
              ? "This item is waiting for the organizer's approval. Bidding opens once it's approved."
              : "Bidding has closed on this item. Thanks to everyone who bid!"}
          </Callout>
        )}
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} active="items" />
      <BidderSignIn
        open={signIn}
        onClose={() => setSignIn(false)}
        onSignedIn={(b) => {
          setSignIn(false);
          toast(`Welcome, ${b.displayName}`);
          submit(b.id);
        }}
      />
    </Screen>
  );
}
