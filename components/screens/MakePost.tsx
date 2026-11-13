"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { BusinessLogo, ItemArt, ItemIcon } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Callout,
  Card,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  PageBody,
  PrimaryButton,
  SecondaryButton,
  TextArea,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { getItemDetail, getStudentById, getTeam, listPosts, submitPost, type ItemDetail } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money, sentence } from "@/lib/format";
import { useViewer } from "@/lib/session";
import type { PostFormat } from "@/lib/types";
import { Screen, useRouteParams } from "./shared";

function defaultCaption({ item, business, auction }: ItemDetail) {
  const what = item.title.charAt(0).toLowerCase() + item.title.slice(1);
  return `${business.name} just donated ${what} to our auction. Bid now, outbid your friends, and support the ${auction.nonprofitName}. Link in bio.`;
}

/** Screen 07: a student builds a story, feed post or TikTok and sends it for approval. */
export function MakePost() {
  const { auction: slug, item: itemId } = useRouteParams<"auction" | "item">();
  const viewer = useViewer();
  const toast = useToast();
  const detail = useData(() => getItemDetail(itemId), [itemId]);
  const me = useData(async () => (viewer.studentId ? getStudentById(viewer.studentId) : null), [viewer.studentId]);
  const myTeam = useData(async () => (me ? getTeam(me.teamId) : null), [me?.teamId]);
  const mine = useData(
    async () => (viewer.studentId ? (await listPosts({ itemId })).filter((p) => p.studentId === viewer.studentId) : []),
    [itemId, viewer.studentId],
  );
  const [format, setFormat] = useState<PostFormat>("story");
  const [caption, setCaption] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (detail === undefined || me === undefined || myTeam === undefined || mine === undefined) return <ScreenSkeleton />;
  if (!detail || detail.auction.slug !== slug) return <NotFound what="item" />;
  if (!me) {
    return (
      <Screen>
        <GradientHeader eyebrow={detail.auction.name}>
          <Headline highlight="first.">Join the auction</Headline>
          <HeaderSubtitle>Students make posts. Pick your grade to get started.</HeaderSubtitle>
        </GradientHeader>
        <PageBody>
          <PrimaryButton href={`/a/${slug}/join`} variant="gradient">
            Join now
          </PrimaryButton>
        </PageBody>
      </Screen>
    );
  }

  const { item, auction } = detail;
  const text = caption ?? defaultCaption(detail);
  const approver = auction.approverName ?? "your organizer";
  const handle = auction.socialHandle ?? "the school account";

  async function send() {
    try {
      await submitPost({ itemId: item.id, studentId: me!.id, format, caption: text });
      setSent(true);
      window.scrollTo({ top: 0 });
    } catch {
      toast("Write a caption first", "error");
    }
  }

  if (sent) {
    return (
      <Screen>
        <GradientHeader eyebrow={auction.name}>
          <Headline highlight="sent!">Post</Headline>
          <HeaderSubtitle>
            {approver} will review it. Once it&apos;s up on {handle}, you&apos;ll get a link to reshare.
          </HeaderSubtitle>
        </GradientHeader>
        <PageBody>
          <Card className="flex flex-col items-center px-6 py-8 text-center">
            <CircleCheck className="size-16 text-green-500" aria-hidden="true" />
            <p className="mt-3 font-display text-xl font-extrabold text-navy-900">Waiting for approval</p>
            <p className="mt-1 text-ink-500">Posts usually go up the same day.</p>
          </Card>
          <SecondaryButton onClick={() => { setSent(false); setCaption(null); }}>Make another format</SecondaryButton>
          <PrimaryButton href={`/a/${slug}/me`} variant="gradient">
            Back to my stuff
          </PrimaryButton>
        </PageBody>
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} back={`/a/${slug}/items/${item.id}`}>
        <Headline highlight="post">Make a</Headline>
        <HeaderSubtitle>Bring the item to life. We handle the approval.</HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-5">
        <ChipGroup
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            { value: "story", label: "Story" },
            { value: "feed", label: "Feed post" },
            { value: "tiktok", label: "TikTok" },
          ]}
        />

        <PostPreview detail={detail} format={format} handle={handle} studentLine={`${me.displayName} · ${myTeam?.kind === "grade" ? myTeam.name : "Faculty"}`} />

        <TextArea label="Caption" rows={3} value={text} onChange={(e) => setCaption(e.target.value)} maxLength={2200} />

        {mine.length > 0 ? (
          <p className="text-sm text-ink-500">
            You&apos;ve made {mine.length} post{mine.length === 1 ? "" : "s"} for this item:{" "}
            {mine.map((p) => `${p.format} (${p.status})`).join(", ")}.
          </p>
        ) : null}

        <Callout tone="info" icon={<ShieldCheck />}>
          Goes to {approver} for approval, then posts from {handle}. You get a link to reshare.
        </Callout>
        <PrimaryButton onClick={send}>Send for Approval</PrimaryButton>
        <Link href={`/a/${slug}/items/${item.id}`} className="block text-center text-sm font-bold text-blue-600">
          Cancel
        </Link>
      </PageBody>
    </Screen>
  );
}

/** The post image as it will look. Phase 5 renders the same layout with next/og. */
export function PostPreview({
  detail,
  format,
  handle,
  studentLine,
}: {
  detail: ItemDetail;
  format: PostFormat;
  handle: string;
  studentLine: string;
}) {
  const { item, business, auction } = detail;
  const tall = format !== "feed";
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-[#0752B0] via-teal-500 to-lime-400 p-5 text-white shadow-xl transition-all",
        tall ? "max-w-[300px]" : "max-w-[340px]",
      )}
      style={{ aspectRatio: tall ? "9 / 14" : "4 / 5" }}
      aria-label={`${format} preview`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-display font-extrabold italic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/tag-white.png" alt="" className="h-5 w-auto" /> Outbid
        </span>
        <span className="text-sm font-bold">{format === "tiktok" ? handle.replace("@", "@tt.") : handle}</span>
      </div>
      {item.photoPath ? (
        <ItemArt art={item.artIcon} photo={item.photoPath} className="mt-3 h-32 rounded-2xl">
          <BusinessLogo name={business.name} logo={business.logoPath} size="sm" className="absolute bottom-2 left-2" />
        </ItemArt>
      ) : (
        <div className="mt-3 flex flex-col items-center rounded-2xl bg-white px-3 py-4 text-navy-900">
          {business.logoPath ? (
            <BusinessLogo name={business.name} logo={business.logoPath} size="md" className="shadow-none" />
          ) : (
            <ItemIcon art={item.artIcon} className="size-14 text-teal-500" strokeWidth={1.75} />
          )}
          <p className="mt-2 font-display font-bold">{business.name}</p>
        </div>
      )}
      <p className="mt-4 font-display text-[1.6rem] leading-tight font-extrabold tracking-[-0.03em]">{item.title}</p>
      <p className="mt-1 text-sm leading-snug">
        Donated by {sentence(business.name)} Current bid {money(item.currentBidCents ?? item.startingBidCents)}. Every dollar to the{" "}
        {auction.nonprofitName}.
      </p>
      <div className="mt-auto pt-4">
        <div className="rounded-full bg-navy-900 py-3 text-center font-display font-bold">Tap to bid →</div>
        <p className="mt-2 text-center text-xs">Secured by {studentLine}</p>
      </div>
    </div>
  );
}
