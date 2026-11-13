"use client";

import { useState } from "react";
import { ScanLine, Share2, UsersRound } from "lucide-react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Callout,
  Card,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  InstagramIcon,
  ListCard,
  ListRow,
  PageBody,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  StatRow,
  StatTile,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  getBusinessByToken,
  getItemDetail,
  getStudentById,
  isAuctionOpen,
  listItemsForBusiness,
  listItemViews,
  listPosts,
} from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { FEATURE_RESHARES } from "@/lib/flags";
import { compact, money } from "@/lib/format";
import { Screen, useRouteParams } from "./shared";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayName = (iso: string) => DAY[new Date(`${iso}T12:00:00`).getDay()]!;

/** Screen 08: a business's private dashboard. The token in the URL is the credential. */
export function BusinessDashboard() {
  const { token } = useRouteParams<"token">();
  const toast = useToast();
  const business = useData(() => getBusinessByToken(token), [token]);
  const items = useData(async () => (business ? listItemsForBusiness(business.id) : []), [business?.id]);
  const [pick, setPick] = useState<string | null>(null);
  const itemId = pick ?? items?.[0]?.id ?? null;
  const detail = useData(async () => (itemId ? getItemDetail(itemId) : null), [itemId]);
  const views = useData(async () => (itemId ? listItemViews(itemId, 7) : []), [itemId]);
  const posts = useData(async () => (itemId ? listPosts({ itemId }) : []), [itemId]);
  const referrer = useData(
    async () => (business?.referredByStudentId ? getStudentById(business.referredByStudentId) : null),
    [business?.referredByStudentId],
  );

  if ([business, items, detail, views, posts, referrer].some((x) => x === undefined)) return <ScreenSkeleton />;
  if (!business) return <NotFound what="dashboard" />;
  if (!detail) return <NotFound what="item" />;

  const { item, auction, student } = detail;
  const posted = posts!.filter((p) => p.status === "posted");
  const totalViews = views!.reduce((n, v) => n + v.count, 0);
  const max = Math.max(1, ...views!.map((v) => v.count));
  const peak = views!.reduce((a, b) => (b.count > a.count ? b : a), views![0]!);
  const peakPost = posted.find((p) => p.postedOn === peak.date);
  const live = isAuctionOpen(auction) && item.status === "live";
  const status = item.status === "pending" ? "In review" : live ? "Live" : item.status === "live" ? "Closed" : item.status[0]!.toUpperCase() + item.status.slice(1);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/a/${auction.slug}/items/${item.id}` : "";

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: item.title, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        toast("Link to your item copied");
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name}>
        <Headline highlight="impact">Your item&apos;s</Headline>
        <HeaderSubtitle className="max-w-none">
          {business.name} · {item.title}
          {student ? ` · Secured by ${student.displayName}` : ""}
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        {items!.length > 1 ? (
          <ChipGroup
            label="Your items"
            value={itemId}
            onChange={setPick}
            options={items!.map((i) => ({ value: i.id, label: i.title }))}
          />
        ) : null}

        <StatRow>
          <StatTile value={compact(totalViews)} label="Views" />
          <StatTile value={posted.length} label={posted.length === 1 ? "Post" : "Posts"} />
          <StatTile value={item.bidCount} label="Bids" />
        </StatRow>

        <div className="flex items-center justify-between rounded-card border border-lime-400/50 bg-lime-50 px-5 py-4">
          <div>
            <p className="section-label text-navy-900">{item.currentBidCents ? "Top bid" : "Starting bid"}</p>
            <p className="font-display text-4xl font-extrabold tracking-[-0.03em] text-green-700">
              {money(item.currentBidCents ?? item.startingBidCents)}
            </p>
          </div>
          <Pill tone={live ? "accent" : "default"} className={cn(live && "bg-lime-400/40")}>
            {status}
          </Pill>
        </div>

        {item.status === "pending" ? (
          <Callout tone="info">The organizer is reviewing your item. You&apos;ll get a text when it goes live.</Callout>
        ) : null}

        <section>
          <SectionLabel>Views this week</SectionLabel>
          <Card className="px-4 pt-5 pb-4">
            <div className="flex h-32 items-end gap-2" role="img" aria-label={`Daily views: ${views!.map((v) => `${dayName(v.date)} ${v.count}`).join(", ")}`}>
              {views!.map((v) => (
                <div key={v.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <div
                    className={cn("w-full rounded-lg transition-all", v === peak && v.count > 0 ? "bg-blue-600" : "bg-teal-500")}
                    style={{ height: `${Math.max(4, (v.count / max) * 100)}%` }}
                  />
                  <span className="text-[0.7rem] font-bold text-ink-500">{dayName(v.date).slice(0, 2)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-500">
              {peak.count > 0
                ? `Spike on ${dayName(peak.date)}${peakPost?.channel ? `: ${peakPost.channel}` : ""}, ${peak.count.toLocaleString()} views`
                : "Views show up here once your item is live."}
            </p>
          </Card>
        </section>

        <section>
          <SectionLabel>Where you appeared</SectionLabel>
          {posted.length === 0 && !FEATURE_RESHARES ? (
            <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-ink-500">
              Students are making posts about your item now.
            </p>
          ) : (
            <ListCard>
              {posted.map((p) => (
                <ListRow
                  key={p.id}
                  leading={
                    <IconTile tone="mint">{p.channel?.includes("school") ? <InstagramIcon /> : <UsersRound />}</IconTile>
                  }
                  title={p.channel ?? "Instagram"}
                  subtitle={`${p.postedOn ? dayName(p.postedOn) : ""} · ${p.views.toLocaleString()} views`}
                  trailing={
                    p.postedUrl ? (
                      <a
                        href={p.postedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-chip px-4 py-2 font-display text-sm font-bold text-navy-900 hover:bg-border"
                      >
                        Open
                      </a>
                    ) : null
                  }
                />
              ))}
              {FEATURE_RESHARES && posted.length > 0 ? (
                <ListRow
                  leading={
                    <IconTile tone="mint">
                      <Share2 />
                    </IconTile>
                  }
                  title={`${posted.length * 10 + 1} student reshares`}
                  subtitle={`${(posted.length * 680).toLocaleString()} views combined · demo data`}
                />
              ) : null}
            </ListCard>
          )}
        </section>

        <Callout title="After the auction">
          The winner gets a prize pass. When they come in, scan it or tap Redeem here.
        </Callout>

        <PrimaryButton href={`/b/${token}/redeem`} variant="gradient" icon={<ScanLine />} arrow={false}>
          Scan a prize pass
        </PrimaryButton>
        <div className="grid grid-cols-2 gap-3">
          <SecondaryButton
            variant="navy"
            href={referrer ? `/give/${auction.slug}/${referrer.slug}/item` : `/a/${auction.slug}`}
          >
            Donate another
          </SecondaryButton>
          <SecondaryButton onClick={share}>Share my page</SecondaryButton>
        </div>
      </PageBody>
    </Screen>
  );
}
