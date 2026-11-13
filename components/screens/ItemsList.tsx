"use client";

import Link from "next/link";
import { useState } from "react";
import { Crown, Heart } from "lucide-react";
import { BusinessLogo, ItemArt } from "@/components/app/ItemArt";
import { MessageScreen, NotFound, ScreenSkeleton } from "@/components/app/States";
import {
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  PageBody,
  Pill,
  TabBar,
  TabBarSpacer,
} from "@/components/ui";
import { isAuctionOpen, listItemDetails } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money, timeLeft } from "@/lib/format";
import { useViewer } from "@/lib/session";
import { Screen, useAuction, useRouteParams } from "./shared";

type Sort = "popular" | "low" | "value";

/** The "Items" tab: every live item in the auction. */
export function ItemsList() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const viewer = useViewer();
  const [sort, setSort] = useState<Sort>("popular");
  const items = useData(async () => (auction ? listItemDetails(auction.id) : []), [auction?.id]);

  if (auction === undefined || items === undefined) return <ScreenSkeleton />;
  if (auction === null) return <NotFound what="auction" />;
  if (auction.status === "draft")
    return <MessageScreen kind="waiting" title="Almost" highlight="ready." body="This auction hasn't opened yet. Check back soon." />;

  const open = isAuctionOpen(auction);
  // Show what's biddable; once bidding closes, show the closed items too.
  const visible = items.filter((d) => d.item.status === "live" || d.item.status === "closed");
  const sorted = [...visible].sort((a, b) =>
    sort === "popular"
      ? b.item.bidCount - a.item.bidCount
      : sort === "low"
        ? (a.item.currentBidCents ?? a.item.startingBidCents) - (b.item.currentBidCents ?? b.item.startingBidCents)
        : b.item.retailValueCents - a.item.retailValueCents,
  );

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} watermark>
        <Headline highlight="good.">Bid on something</Headline>
        <HeaderSubtitle>
          Every dollar goes to the {auction.nonprofitName}. You only pay if you win.
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-5">
        <ChipGroup
          label="Sort items"
          value={sort}
          onChange={setSort}
          options={[
            { value: "popular", label: "Most bids" },
            { value: "low", label: "Lowest bid" },
            { value: "value", label: "Top value" },
          ]}
          trailing={<Pill tone={open ? "accent" : "navy"}>{open ? timeLeft(auction.closesAt) : "Closed"}</Pill>}
        />
        {sorted.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-12 text-center text-ink-500">
            <Heart className="mx-auto mb-3 size-8 text-teal-500" aria-hidden="true" />
            No items yet. Students are out asking local businesses right now.
          </div>
        ) : (
          <ul className="space-y-4">
            {sorted.map(({ item, business }) => {
              const leading = viewer.bidderId && item.leadingBidderId === viewer.bidderId;
              return (
                <li key={item.id}>
                  <Link
                    href={`/a/${slug}/items/${item.id}`}
                    className="group block overflow-hidden rounded-card border border-border bg-card transition hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.99]"
                  >
                    <ItemArt art={item.artIcon} photo={item.photoPath} className="h-36 rounded-none">
                      <BusinessLogo name={business.name} logo={business.logoPath} size="md" className="absolute top-3 left-3" />
                      {leading ? (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold tracking-wider text-navy-900 uppercase">
                          <Crown className="size-3.5" aria-hidden="true" /> You lead
                        </span>
                      ) : null}
                    </ItemArt>
                    <div className="flex items-end justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg leading-tight font-extrabold tracking-[-0.02em] text-navy-900">
                          {item.title}
                        </h2>
                        <p className="truncate text-sm text-ink-500">{business.name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-display text-xl font-extrabold tracking-[-0.03em] text-blue-600">
                          {money(item.currentBidCents ?? item.startingBidCents)}
                        </div>
                        <div className="text-xs text-ink-500">
                          {item.bidCount ? `${item.bidCount} bid${item.bidCount === 1 ? "" : "s"}` : "Starting bid"}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} />
    </Screen>
  );
}
