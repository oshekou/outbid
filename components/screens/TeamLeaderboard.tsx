"use client";

import { useState } from "react";
import { UsersRound } from "lucide-react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import {
  Avatar,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  ListCard,
  ListRow,
  PageBody,
  Pill,
  SectionLabel,
  TabBar,
  TabBarSpacer,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { getLeaderboard, getTeamLeaderboard } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { plural } from "@/lib/format";
import { useViewer } from "@/lib/session";
import { Screen, useAuction, useRouteParams } from "./shared";

const WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
const tones = ["lime", "mint", "sky"] as const;

/** Screen 12: squads inside one grade, ranked by points per person, plus top askers. */
export function TeamLeaderboard() {
  const { auction: slug, team: teamId } = useRouteParams<"auction" | "team">();
  const auction = useAuction(slug);
  const viewer = useViewer();
  const [tab, setTab] = useState<"squads" | "people">("squads");
  const data = useData(() => getTeamLeaderboard(teamId), [teamId]);
  const board = useData(async () => (auction ? getLeaderboard(auction.id) : null), [auction?.id]);

  if (auction === undefined || data === undefined || board === undefined) return <ScreenSkeleton />;
  if (!auction || !data || !board) return <NotFound what="team" />;

  const { team, squads, students } = data;
  const rank = board.teams.findIndex((t) => t.id === team.id) + 1;
  const total = board.teams.length;
  const mine = students.some((s) => s.studentId === viewer.studentId);
  const year = team.classYear ? String(team.classYear) : null;
  const ranked = [...students].sort((a, b) => b.points - a.points);

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} back={`/a/${slug}/leaderboard`}>
        {year ? <Headline highlight={year}>Class of</Headline> : <Headline highlight="staff">Faculty &amp;</Headline>}
        <HeaderSubtitle>
          {mine ? "You're" : "They're"} #{rank} out of {WORDS[total - 1] ?? total} teams.{" "}
          {rank === 1 ? "Keep the momentum going." : "Every item counts. Go ask a business."}
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody className="space-y-4">
        <ChipGroup
          label="View"
          value={tab}
          onChange={setTab}
          options={[
            { value: "squads", label: "Squads" },
            { value: "people", label: "Individuals" },
          ]}
          trailing={<Pill>#{rank} of {total}</Pill>}
        />

        {tab === "squads" ? (
          squads.length === 0 ? (
            <p className="rounded-card border border-dashed border-border px-4 py-8 text-center text-ink-500">
              Nobody has joined {team.name} yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {squads.map((sq, i) => (
                <li
                  key={sq.id}
                  className={cn(
                    "flex items-center gap-4 rounded-card border-[1.5px] px-4 py-3.5",
                    i === 0 ? "border-lime-400 bg-lime-50/60" : "border-border bg-card",
                  )}
                >
                  <span className="w-6 font-display text-3xl font-extrabold text-blue-600">{i + 1}</span>
                  <IconTile tone={sq.isSolo ? "navy" : tones[i % tones.length]}>
                    <UsersRound />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg leading-tight font-bold text-navy-900">{sq.name}</p>
                    <p className="text-sm leading-snug text-ink-500">
                      {plural(sq.members, "person", "people")} · {plural(sq.items, "item")} · {plural(sq.bids, "bid")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl leading-none font-extrabold text-navy-900">{sq.perPerson}</p>
                    <p className="text-xs text-ink-500">pts/person</p>
                  </div>
                </li>
              ))}
            </ol>
          )
        ) : null}

        <section>
          {tab === "squads" ? <SectionLabel className="mt-2">Top askers in {year ?? "faculty"}</SectionLabel> : null}
          {ranked.length === 0 ? null : (
            <ListCard>
              {(tab === "squads" ? ranked.slice(0, 3) : ranked).map((s, i) => (
                <ListRow
                  key={s.studentId}
                  leading={
                    tab === "people" ? (
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-display text-lg font-extrabold text-blue-600">{i + 1}</span>
                        <Avatar name={s.displayName} tone="gradient" />
                      </div>
                    ) : (
                      <Avatar name={s.displayName} tone="gradient" />
                    )
                  }
                  title={s.studentId === viewer.studentId ? `${s.displayName} (you)` : s.displayName}
                  subtitle={`${s.squadName ?? "Solo"} · ${s.items} item${s.items === 1 ? "" : "s"}`}
                  trailing={<span className="font-display text-lg font-extrabold text-teal-500">{s.points} pts</span>}
                />
              ))}
            </ListCard>
          )}
        </section>
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug={slug} active="leaderboard" />
    </Screen>
  );
}
