"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Share } from "lucide-react";
import { ScreenSkeleton, NotFound } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Card,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  Logo,
  PageBody,
  QRCard,
  SecondaryButton,
  TabBar,
  TabBarSpacer,
} from "@/components/ui";
import { getStudentById, getTeam } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { useViewer } from "@/lib/session";
import { Screen, useAuction, useRouteParams } from "./shared";

/** The public short link a business opens. outbid.app once the domain is set up. */
export function giveUrl(auctionSlug: string, studentSlug: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://outbid.app";
  return `${base}/give/${auctionSlug}/${studentSlug}`;
}

/** Screen 04: the student's personal QR card to show a business. */
export function AskCard() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const viewer = useViewer();
  const router = useRouter();
  const toast = useToast();
  const student = useData(async () => (viewer.studentId ? getStudentById(viewer.studentId) : null), [viewer.studentId]);
  const team = useData(async () => (student ? getTeam(student.teamId) : null), [student?.teamId]);

  // No student on this device yet: send them to join first.
  useEffect(() => {
    if (student === null) router.replace(`/a/${slug}/join`);
  }, [student, router, slug]);

  if (auction === undefined || student === undefined || team === undefined || student === null) return <ScreenSkeleton />;
  if (auction === null) return <NotFound what="auction" />;

  const url = giveUrl(slug, student.slug);
  const display = url.replace(/^https?:\/\//, "");
  const firstName = student.displayName.split(" ")[0];

  async function share() {
    const data = { title: `Donate to the ${auction!.name}`, text: `${firstName} from ${auction!.schoolName} is asking local businesses to donate an item.`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* cancelled */
      }
    } else {
      await copy();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Couldn't copy. Long-press the link instead.", "error");
    }
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name}>
        <Headline highlight="business">Show this to a</Headline>
        <HeaderSubtitle>Your personal QR card makes donating easy.</HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-5">
        <Card className="flex flex-col items-center px-5 pt-6 pb-6 text-center">
          <Logo variant="color" width={150} />
          <h2 className="mt-3 font-display text-2xl leading-tight font-extrabold tracking-[-0.03em] text-navy-900">
            Donate to the {auction.name}
          </h2>
          <p className="mt-2 max-w-[34ch] text-ink-500">
            Scan, add an item in two minutes, and our students post about your business all month.
          </p>
          <QRCard
            className="mt-4"
            value={`${url}?src=qr`}
            displayUrl={display}
            badge={`${student.displayName} · ${team?.name ?? ""}`}
          />
        </Card>

        <div className="rounded-card bg-navy-900 px-5 py-5 text-white">
          <p className="section-label text-lime-400">Say this</p>
          <p className="mt-2 text-[1.05rem] leading-relaxed">
            &ldquo;We&apos;re running a silent auction for the {auction.nonprofitName}. If you donate something, our class
            posts about you to the whole school. Here&apos;s the link.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SecondaryButton variant="lime" icon={<Share />} onClick={share}>
            Share card
          </SecondaryButton>
          <SecondaryButton icon={<Copy />} onClick={copy}>
            Copy link
          </SecondaryButton>
        </div>
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} active="me" />
    </Screen>
  );
}
