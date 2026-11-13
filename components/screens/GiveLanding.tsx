"use client";

import { ChartNoAxesColumn, QrCode } from "lucide-react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import {
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  InstagramIcon,
  PageBody,
  PrimaryButton,
  SectionLabel,
  StatRow,
  StatTile,
} from "@/components/ui";
import { getStudent } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { compact } from "@/lib/format";
import { Screen, useAuction, useRouteParams } from "./shared";

const IDEAS = ["A party for 10", "A month of coffee", "A lesson", "A gift card", "Dinner for two", "Your product, signed"];

/** Screen 05: what a business sees after scanning a student's QR. No account needed. */
export function GiveLanding() {
  const { auction: slug, student: studentSlug } = useRouteParams<"auction" | "student">();
  const auction = useAuction(slug);
  const student = useData(async () => (auction ? getStudent(auction.id, studentSlug) : null), [auction?.id, studentSlug]);

  if (auction === undefined || student === undefined) return <ScreenSkeleton />;
  if (!auction || !student) return <NotFound what="donation link" />;

  const first = student.displayName.split(" ")[0];
  const perks = [
    { icon: <InstagramIcon />, title: "Student posts with your logo", body: `On the school Instagram, reshared by students` },
    { icon: <ChartNoAxesColumn />, title: "A dashboard of views and bids", body: "See exactly who saw your item" },
    { icon: <QrCode />, title: "One scan to redeem", body: "Winner shows a prize pass. You tap once." },
  ];

  return (
    <Screen>
      <GradientHeader eyebrow={`${first} from ${auction.schoolName} asked you`} divider>
        <Headline highlight="Get seen." breakBeforeHighlight>
          Donate one thing.
        </Headline>
        <HeaderSubtitle className="max-w-none">
          The {auction.name} benefits the {auction.nonprofitName}. 100% of proceeds go to the cause.
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        <StatRow>
          <StatTile value={auction.reachFamilies || "—"} label={`${auction.schoolName} families`} />
          <StatTile value={auction.reachFollowers ? compact(auction.reachFollowers) : "—"} label="School followers" />
          <StatTile value="$0" label="Cost to you" />
        </StatRow>

        <section>
          <SectionLabel>What you get</SectionLabel>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.title} className="flex items-center gap-4 rounded-card border border-border bg-card px-4 py-4">
                <IconTile tone="lime" className="size-14">
                  {p.icon}
                </IconTile>
                <div className="min-w-0">
                  <p className="font-display text-[1.05rem] leading-tight font-bold text-navy-900">{p.title}</p>
                  <p className="mt-0.5 text-[0.95rem] text-ink-500">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-card bg-lime-50 px-5 py-4">
          <p className="font-display text-lg font-bold text-navy-900">Ideas that work</p>
          <p className="mt-1 leading-relaxed text-navy-900">
            {IDEAS.map((idea, i) => (
              <span key={idea}>
                {idea}
                {i < IDEAS.length - 1 ? <span className="mx-1.5 text-green-500" aria-hidden="true">•</span> : null}
              </span>
            ))}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <PrimaryButton href={`/give/${slug}/${studentSlug}/item`} variant="gradient">
            Donate an Item
          </PrimaryButton>
          <p className="text-center text-ink-500">No account needed. Two minutes.</p>
        </div>
      </PageBody>
    </Screen>
  );
}
