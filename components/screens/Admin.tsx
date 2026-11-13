"use client";

import { useState } from "react";
import { Copy, Download, ExternalLink, Gavel, Link2, Megaphone, PackageCheck, TriangleAlert } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { BusinessLogo, ItemArt } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Card,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  PageBody,
  Pill,
  PrimaryButton,
  QRCard,
  SecondaryButton,
  SectionLabel,
  StatRow,
  StatTile,
  TextArea,
  TextField,
} from "@/components/ui";
import {
  closeAuction,
  getBusiness,
  getItemDetail,
  getStudentById,
  isAuctionOpen,
  listItemDetails,
  listPosts,
  listWins,
  markPostPosted,
  markWinPaid,
  reviewItem,
  reviewPost,
} from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { compact, money, timeAgo, timeLeft } from "@/lib/format";
import type { Post } from "@/lib/types";
import { Screen, useAuction, useRouteParams } from "./shared";

type Tab = "posts" | "items" | "controls";

/** Organizer home: totals, post and item approval queues, auction controls. */
export function Admin() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("posts");
  const [closing, setClosing] = useState(false);
  const items = useData(async () => (auction ? listItemDetails(auction.id, { includePending: true }) : []), [auction?.id]);
  const posts = useData(async () => (auction ? listPosts({ auctionId: auction.id }) : []), [auction?.id]);
  // Flag wins unpaid for 48 hours (open question 4: offer to the next bidder).
  const wins = useData(async () => {
    if (!auction) return [];
    const now = Date.now();
    return (await listWins(auction.id)).map((w) => ({
      ...w,
      late: w.win.paymentStatus === "pending" && now - new Date(w.win.createdAt).getTime() > 48 * 3600_000,
    }));
  }, [auction?.id]);

  if ([auction, items, posts, wins].some((x) => x === undefined)) return <ScreenSkeleton />;
  if (!auction) return <NotFound what="auction" />;

  const live = items!.filter((i) => i.item.status !== "pending");
  const pendingItems = items!.filter((i) => i.item.status === "pending");
  const queue = posts!.filter((p) => p.status === "pending" || p.status === "approved");
  const raised = live.reduce((n, i) => n + (i.item.currentBidCents ?? 0), 0);
  const bids = live.reduce((n, i) => n + i.item.bidCount, 0);
  const open = isAuctionOpen(auction);
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/a/${slug}/join` : `/a/${slug}/join`;
  const approver = auction.approverName ?? "Organizer";

  return (
    <Screen>
      <GradientHeader eyebrow={`Organizer · ${auction.name}`}>
        <Headline highlight="show.">Run the</Headline>
        <HeaderSubtitle>
          For the {auction.nonprofitName}. {open ? `Closes in ${timeLeft(auction.closesAt).replace(" left", "")}.` : "Bidding is closed."}
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-5">
        <StatRow>
          <StatTile value={raised >= 100000 ? `$${compact(raised / 100)}` : money(raised)} label="Bid so far" />
          <StatTile value={live.length} label="Items" />
          <StatTile value={bids} label="Bids" />
        </StatRow>

        <ChipGroup
          label="Admin section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "posts", label: `Posts${queue.length ? ` · ${queue.length}` : ""}` },
            { value: "items", label: `Items${pendingItems.length ? ` · ${pendingItems.length}` : ""}` },
            { value: "controls", label: "Controls" },
          ]}
        />

        {tab === "posts" ? (
          queue.length === 0 ? (
            <Empty icon={<Megaphone />} text="No posts waiting. Students' posts show up here for approval." />
          ) : (
            <ul className="space-y-4">
              {queue.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} approver={approver} handle={auction.socialHandle} slug={slug} />
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "items" ? (
          <section className="space-y-4">
            {pendingItems.length === 0 ? (
              <Empty icon={<PackageCheck />} text="Every donated item is approved. New donations land here first." />
            ) : (
              pendingItems.map(({ item, business, student }) => (
                <Card key={item.id} className="overflow-hidden">
                  <ItemArt art={item.artIcon} photo={item.photoPath} className="h-28 rounded-none">
                    <BusinessLogo name={business.name} logo={business.logoPath} size="md" className="absolute top-3 left-3" />
                  </ItemArt>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="font-display text-lg font-extrabold text-navy-900">{item.title}</p>
                      <p className="text-sm text-ink-500">
                        {business.name} · Retail {money(item.retailValueCents)} · Starts at {money(item.startingBidCents)}
                        {student ? ` · Secured by ${student.displayName}` : ""}
                      </p>
                      <p className="mt-2 text-navy-900">{item.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <SecondaryButton
                        onClick={async () => {
                          await reviewItem(item.id, false);
                          toast("Item removed");
                        }}
                      >
                        Decline
                      </SecondaryButton>
                      <SecondaryButton
                        variant="lime"
                        onClick={async () => {
                          await reviewItem(item.id, true);
                          toast(`${item.title} is live`);
                        }}
                      >
                        Approve
                      </SecondaryButton>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <SectionLabel className="pt-2">Live items</SectionLabel>
            <ul className="divide-y divide-border rounded-card border border-border bg-card">
              {live.map(({ item, business }) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-navy-900">{item.title}</p>
                    <p className="truncate text-sm text-ink-500">
                      {business.name} · {item.bidCount} bids
                    </p>
                  </div>
                  <span className="shrink-0 font-display font-extrabold text-blue-600">{money(item.currentBidCents ?? item.startingBidCents)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "controls" ? (
          <section className="space-y-5">
            <div>
              <SectionLabel>Student join link</SectionLabel>
              <Card className="px-5 py-5">
                <QRCard value={joinUrl} displayUrl={joinUrl.replace(/^https?:\/\//, "")} size={140} />
                <SecondaryButton
                  className="mt-4"
                  icon={<Link2 />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(joinUrl);
                      toast("Join link copied");
                    } catch {
                      toast("Couldn't copy", "error");
                    }
                  }}
                >
                  Copy join link
                </SecondaryButton>
              </Card>
            </div>

            {wins!.length > 0 ? (
              <div>
                <SectionLabel>Winners</SectionLabel>
                <ul className="divide-y divide-border rounded-card border border-border bg-card">
                  {wins!.map(({ win, item, bidderName, late }) => {
                    return (
                      <li key={win.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display font-bold text-navy-900">{item.title}</p>
                          <p className="truncate text-sm text-ink-500">
                            {bidderName} · {money(win.amountCents)} · {timeAgo(win.createdAt)}
                          </p>
                        </div>
                        {win.paymentStatus === "paid" ? (
                          <Pill className="h-8 px-3 text-sm">Paid</Pill>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              await markWinPaid(win.id);
                              toast("Marked paid (demo)");
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-full bg-[#FFF3D6] px-3 text-sm font-bold text-[#8A5A00]"
                          >
                            {late ? <TriangleAlert className="size-4" aria-hidden="true" /> : null}
                            {late ? "Unpaid 48h" : "Awaiting payment"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-sm text-ink-500">Demo: tap &ldquo;Awaiting payment&rdquo; to simulate Every.org confirming it.</p>
              </div>
            ) : null}

            {open ? (
              <SecondaryButton variant="navy" icon={<Gavel />} onClick={() => setClosing(true)}>
                Close bidding now
              </SecondaryButton>
            ) : (
              <p className="rounded-card bg-chip px-4 py-3 text-center text-ink-500">Bidding closed. Winners have been texted a pay link.</p>
            )}
          </section>
        ) : null}
      </PageBody>

      <BottomSheet open={closing} onClose={() => setClosing(false)} title="Close bidding?">
        <div className="space-y-4">
          <p className="text-ink-500">
            Every item&apos;s leading bidder wins and gets a link to pay the {auction.nonprofitName} on Every.org. This can&apos;t
            be undone.
          </p>
          <PrimaryButton
            onClick={async () => {
              const w = await closeAuction(auction.id);
              setClosing(false);
              toast(`Bidding closed. ${w.length} winner${w.length === 1 ? "" : "s"} notified.`);
            }}
          >
            Close and pick winners
          </PrimaryButton>
        </div>
      </BottomSheet>
    </Screen>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-card border border-dashed border-border px-6 py-10 text-center text-ink-500">
      <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-chip text-navy-800 [&>svg]:size-6">{icon}</span>
      {text}
    </div>
  );
}

function PostCard({ post, approver, handle, slug }: { post: Post; approver: string; handle: string | null; slug: string }) {
  const toast = useToast();
  const [caption, setCaption] = useState(post.caption);
  const [url, setUrl] = useState("");
  const detail = useData(() => getItemDetail(post.itemId), [post.itemId]);
  const student = useData(() => getStudentById(post.studentId), [post.studentId]);
  const biz = useData(async () => (detail ? getBusiness(detail.business.id) : null), [detail?.business.id]);
  if (!detail || !student || !biz) return <div className="skeleton h-40" />;
  const itemLink = typeof window !== "undefined" ? `${window.location.origin}/a/${slug}/items/${post.itemId}?src=post-${post.id}` : "";

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <ItemArt art={detail.item.artIcon} photo={detail.item.photoPath} className="size-16 shrink-0 rounded-xl" iconClassName="size-12 -right-2 -bottom-2" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-extrabold text-navy-900">{detail.item.title}</p>
          <p className="truncate text-sm text-ink-500">
            {biz.name} · {post.format === "feed" ? "Feed post" : post.format === "tiktok" ? "TikTok" : "Story"} by {student.displayName}
          </p>
        </div>
        <Pill tone={post.status === "approved" ? "accent" : "default"} className="h-7 px-3 text-xs">
          {post.status === "approved" ? "Approved" : "Pending"}
        </Pill>
      </div>
      {post.status === "pending" ? (
        <>
          <TextArea label="Caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
          <div className="grid grid-cols-2 gap-2.5">
            <SecondaryButton
              onClick={async () => {
                await reviewPost(post.id, { approve: false, reviewer: approver });
                toast("Post sent back");
              }}
            >
              Reject
            </SecondaryButton>
            <SecondaryButton
              variant="lime"
              onClick={async () => {
                await reviewPost(post.id, { approve: true, reviewer: approver, caption });
                toast("Approved. Post it from the school account.");
              }}
            >
              Approve
            </SecondaryButton>
          </div>
        </>
      ) : (
        <>
          <p className="rounded-xl bg-surface px-3 py-2 text-[0.95rem] text-navy-900">{post.caption}</p>
          <div className="grid grid-cols-2 gap-2.5">
            <SecondaryButton size="sm" icon={<Download />} href={`/a/${slug}/items/${post.itemId}/post`}>
              View image
            </SecondaryButton>
            <SecondaryButton
              size="sm"
              icon={<Copy />}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${post.caption}\n\n${itemLink}`);
                  toast("Caption and link copied");
                } catch {
                  toast("Couldn't copy", "error");
                }
              }}
            >
              Copy text
            </SecondaryButton>
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await markPostPosted(post.id, url, `${handle ?? "School"} ${post.format === "feed" ? "feed" : post.format === "tiktok" ? "TikTok" : "story"}`);
                toast("Marked as posted");
              } catch {
                toast("Paste the post's full link", "error");
              }
            }}
          >
            <TextField className="flex-1" label="Posted? Paste the link" placeholder="https://instagram.com/…" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" />
            <SecondaryButton type="submit" variant="navy" className="w-auto px-4" icon={<ExternalLink />}>
              Done
            </SecondaryButton>
          </form>
        </>
      )}
    </Card>
  );
}
