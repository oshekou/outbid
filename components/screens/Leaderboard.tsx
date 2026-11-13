"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { BusinessLogo } from "@/components/app/ItemArt";
import {
  Chip,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  ListCard,
  ListRow,
  PageBody,
  Pill,
  ProgressBar,
  TabBar,
  TabBarSpacer,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { getBusinessLeaderboard, getLeaderboard, getStudentById, isAuctionOpen, listSquads } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money, plural, timeLeft } from "@/lib/format";
import { useViewer } from "@/lib/session";
import { Amount, Screen, useAuction, useRouteParams } from "./shared";

/** Screen 11: grades ranked by points per person, plus a businesses tab. */
export function Leaderboard() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const viewer = useViewer();
  const router = useRouter();
  const [tab, setTab] = useState<"grades" | "biz">("grades");
  const board = useData(async () => (auction ? getLeaderboard(auction.id) : null), [auction?.id]);
  const biz = useData(async () => (auction ? getBusinessLeaderboard(auction.id) : []), [auction?.id]);
  const me = useData(async () => (viewer.studentId ? getStudentById(viewer.studentId) : null), [viewer.studentId]);
  const topSquads = useData(async () => {
    const first = board?.teams[0];
    return first ? listSquads(first.id) : [];
  }, [board?.teams[0]?.id]);

  if (auction === undefined || board === undefined || biz === undefined || me === undefined) return <ScreenSkeleton />;
  if (!auction || !board) return <NotFound what="auction" />;

  const top = board.teams[0]?.perPerson || 1;
  const open = isAuctionOpen(auction);

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} watermark>
        <Headline highlight="Leaderboard">The</Headline>
        <HeaderSubtitle>Scored on items and bids per person. Teachers count too.</HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-4">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]" role="tablist" aria-label="Leaderboard view">
          <Chip role="tab" aria-selected={tab === "grades"} selected={tab === "grades"} onClick={() => setTab("grades")}>
            Grades
          </Chip>
          <Chip
            role="tab"
            aria-selected={false}
            onClick={() => router.push(me ? `/a/${slug}/leaderboard/${me.teamId}` : `/a/${slug}/join`)}
          >
            My grade
          </Chip>
          <Chip role="tab" aria-selected={tab === "biz"} selected={tab === "biz"} onClick={() => setTab("biz")}>
            Businesses
          </Chip>
          <Pill tone={open ? "accent" : "navy"}>{open ? timeLeft(auction.closesAt) : "Final"}</Pill>
        </div>

        {tab === "grades" ? (
          <ol className="space-y-3">
            {board.teams.map((t, i) => {
              const leader = i === 0;
              const prev = board.teams[0]!;
              const note = leader
                ? topSquads && topSquads[0]
                  ? `Top squad: ${topSquads[0].name} · ${t.perPerson} pts/person`
                  : `${t.perPerson} pts/person`
                : `${(prev.perPerson - t.perPerson).toFixed(1)} pts/person behind ${leaderName(prev.name, prev.label, prev.kind)}`;
              return (
                <li key={t.id}>
                  <Link
                    href={`/a/${slug}/leaderboard/${t.id}`}
                    className={cn(
                      "block rounded-card px-5 py-4 text-white transition active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                      leader ? "bg-gradient-to-br from-[#0B5E8E] to-teal-500" : "bg-navy-800 hover:bg-[#0c3466]",
                    )}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl leading-none font-extrabold text-lime-400 italic">{i + 1}</span>
                      <span className="min-w-0 flex-1 font-display text-xl leading-tight font-bold">
                        {t.kind === "faculty" ? "Faculty and staff" : t.name}
                      </span>
                      <span className="shrink-0 text-sm text-white/80">
                        {plural(t.items, "item")} · {plural(t.bids, "bid")}
                      </span>
                    </div>
                    <ProgressBar className="mt-3" value={t.perPerson / top} label={`${t.name} score`} />
                    <p className="mt-2.5 text-sm text-white/80">{note}</p>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <ListCard>
            {biz.map((b, i) => (
              <ListRow
                key={b.business.id}
                leading={
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-display text-xl font-extrabold text-blue-600">{i + 1}</span>
                    <BusinessLogo name={b.business.name} logo={b.business.logoPath} size="sm" className="border border-border" />
                  </div>
                }
                title={b.business.name}
                subtitle={`${plural(b.items, "item")} · ${plural(b.bids, "bid")}`}
                trailing={<Amount className="text-lg">{money(b.raisedCents)}</Amount>}
              />
            ))}
          </ListCard>
        )}
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} active="leaderboard" />
    </Screen>
  );
}

function leaderName(name: string, label: string, kind: string) {
  return kind === "faculty" ? "the teachers" : `the ${label.toLowerCase()}`;
}
