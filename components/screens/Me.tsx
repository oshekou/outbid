"use client";

import Link from "next/link";
import { Crown, Gavel, GraduationCap, QrCode, Ticket, TrendingDown } from "lucide-react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { ItemArt } from "@/components/app/ItemArt";
import {
  Avatar,
  Card,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  ListCard,
  ListRow,
  PageBody,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  StatRow,
  StatTile,
  TabBar,
  TabBarSpacer,
} from "@/components/ui";
import { getBidder, getItem, getStudentSummary, listBidderActivity } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money } from "@/lib/format";
import { clearViewer, useViewer } from "@/lib/session";
import type { Item } from "@/lib/types";
import { Screen, useAuction, useRouteParams } from "./shared";

const STATUS: Record<Item["status"], string> = {
  pending: "In review",
  live: "Live",
  closed: "Closed",
  paid: "Won & paid",
  redeemed: "Redeemed",
};

/** The "Me" tab: a student's points and items, and/or a bidder's bids and wins. */
export function Me() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const viewer = useViewer();
  const summary = useData(async () => (viewer.studentId ? getStudentSummary(viewer.studentId) : null), [viewer.studentId]);
  const bidder = useData(async () => (viewer.bidderId ? getBidder(viewer.bidderId) : null), [viewer.bidderId]);
  const activity = useData(async () => (viewer.bidderId ? listBidderActivity(viewer.bidderId) : null), [viewer.bidderId]);
  const wonItems = useData(
    async () => (activity ? Promise.all(activity.wins.map(async (w) => ({ win: w, item: await getItem(w.itemId) }))) : []),
    [activity],
  );

  if ([auction, summary, bidder, activity, wonItems].some((x) => x === undefined)) return <ScreenSkeleton />;
  if (!auction) return <NotFound what="auction" />;

  const name = summary?.student.displayName ?? bidder?.displayName;

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name}>
        {name ? (
          <div className="flex items-center gap-4">
            <Avatar name={name} tone="gradient" size="lg" />
            <div className="min-w-0">
              <Headline className="truncate text-[2rem]">{name}</Headline>
              <HeaderSubtitle className="text-base">
                {summary ? `${summary.team.name}${summary.squad ? ` · ${summary.squad.name}` : " · Solo"}` : `Bidder · ${bidder?.town}`}
              </HeaderSubtitle>
            </div>
          </div>
        ) : (
          <>
            <Headline highlight="here?">What brings you</Headline>
            <HeaderSubtitle>Students raise items and climb the leaderboard. Everyone else bids.</HeaderSubtitle>
          </>
        )}
      </GradientHeader>
      <PageBody>
        {!summary && !bidder ? (
          <div className="space-y-3">
            <PrimaryButton href={`/a/${slug}/join`} variant="gradient" icon={<GraduationCap />}>
              I&apos;m a student
            </PrimaryButton>
            <SecondaryButton href={`/a/${slug}`} variant="navy" icon={<Gavel />}>
              I want to bid
            </SecondaryButton>
          </div>
        ) : null}

        {summary ? (
          <section className="space-y-4">
            <StatRow>
              <StatTile value={summary.points} label="Points" />
              <StatTile value={summary.itemsSecured} label="Items" />
              <StatTile value={`#${summary.rankInTeam}`} label={`in ${summary.team.kind === "grade" ? `${summary.team.classYear}` : "staff"}`} />
            </StatRow>
            <Link
              href={`/a/${slug}/ask`}
              className="flex items-center gap-4 rounded-card bg-navy-900 px-5 py-4 text-white transition active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-lime-400 text-navy-900">
                <QrCode className="size-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">My ask card</span>
                <span className="block text-sm text-white/75">Show your QR to a business</span>
              </span>
            </Link>
            <div>
              <SectionLabel>Items I secured</SectionLabel>
              {summary.items.length === 0 ? (
                <Card className="px-5 py-6 text-center text-ink-500">
                  No items yet. Each one is worth 10 points, plus 1 per bid.
                </Card>
              ) : (
                <ListCard>
                  {summary.items.map((it) => (
                    <ListRow
                      key={it.id}
                      href={`/a/${slug}/items/${it.id}`}
                      leading={<ItemArt art={it.artIcon} photo={it.photoPath} className="size-12 rounded-xl" iconClassName="size-10 -right-1 -bottom-1" />}
                      title={it.title}
                      subtitle={`${STATUS[it.status]} · ${it.bidCount} bids`}
                      trailing={<span className="font-display font-extrabold text-blue-600">{money(it.currentBidCents ?? it.startingBidCents)}</span>}
                    />
                  ))}
                </ListCard>
              )}
            </div>
          </section>
        ) : null}

        {bidder && activity ? (
          <section className="space-y-4">
            {wonItems && wonItems.length > 0 ? (
              <div>
                <SectionLabel>Prizes I won</SectionLabel>
                <ListCard>
                  {wonItems.map(({ win, item }) => (
                    <ListRow
                      key={win.id}
                      href={`/pass/${win.passToken}`}
                      leading={<IconTile tone="lime"><Ticket /></IconTile>}
                      title={item?.title ?? "Prize"}
                      subtitle={win.paymentStatus === "paid" ? "Paid · tap for your pass" : "Tap to pay and get your pass"}
                      trailing={<span className="font-display font-extrabold text-navy-900">{money(win.amountCents)}</span>}
                    />
                  ))}
                </ListCard>
              </div>
            ) : null}
            <BidList title="I'm leading" icon={<Crown />} items={activity.leading} slug={slug} empty="You're not leading any items right now." />
            <BidList title="I've been outbid" icon={<TrendingDown />} items={activity.outbid} slug={slug} outbid empty="Nobody has outbid you. Nice." />
          </section>
        ) : null}

        {summary || bidder ? (
          <button type="button" onClick={clearViewer} className="w-full py-3 text-sm font-bold text-ink-500 hover:text-navy-900">
            Sign out on this device
          </button>
        ) : null}
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} active="me" />
    </Screen>
  );
}

function BidList({
  title,
  icon,
  items,
  slug,
  outbid,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: Item[];
  slug: string;
  outbid?: boolean;
  empty: string;
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      {items.length === 0 ? (
        <Card className="px-5 py-5 text-center text-ink-500">{empty}</Card>
      ) : (
        <ListCard>
          {items.map((it) => (
            <ListRow
              key={it.id}
              href={outbid ? `/a/${slug}/items/${it.id}/outbid` : `/a/${slug}/items/${it.id}`}
              leading={<IconTile tone={outbid ? "sky" : "lime"}>{icon}</IconTile>}
              title={it.title}
              subtitle={outbid ? "Tap to take it back" : `${it.bidCount} bids`}
              trailing={<span className="font-display font-extrabold text-navy-900">{money(it.currentBidCents)}</span>}
            />
          ))}
        </ListCard>
      )}
    </div>
  );
}
