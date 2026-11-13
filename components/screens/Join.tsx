"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Sparkle, Star, Trophy, UsersRound, Volleyball } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Callout,
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
  TextField,
  type TileTone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { createSquad, joinAuction, joinInput, listSquads, listTeams } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { setViewer } from "@/lib/session";
import type { SquadIcon } from "@/lib/types";
import { Screen, useAuction, useRouteParams } from "./shared";

export const SQUAD_ICONS: Record<SquadIcon, { icon: typeof Star; tone: TileTone }> = {
  ball: { icon: Volleyball, tone: "lime" },
  sparkle: { icon: Sparkle, tone: "mint" },
  star: { icon: Star, tone: "sky" },
  music: { icon: Music, tone: "sky" },
  trophy: { icon: Trophy, tone: "lime" },
  users: { icon: UsersRound, tone: "mint" },
};

/** Screen 03: a student joins with name + grade and an optional squad. */
export function Join() {
  const { auction: slug } = useRouteParams<"auction">();
  const auction = useAuction(slug);
  const teams = useData(async () => (auction ? listTeams(auction.id) : []), [auction?.id]);
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [squadId, setSquadId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [squadName, setSquadName] = useState("");

  const squads = useData(async () => (teamId ? listSquads(teamId) : []), [teamId]);

  if (auction === undefined || teams === undefined) return <ScreenSkeleton />;
  if (auction === null) return <NotFound what="auction" />;

  const grades = teams.filter((t) => t.kind === "grade");
  const faculty = teams.find((t) => t.kind === "faculty");
  const team = teams.find((t) => t.id === teamId);

  async function join(solo: boolean) {
    const input = { displayName: name, teamId: teamId ?? "", squadId: solo ? null : squadId };
    const r = joinInput.safeParse(input);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    const s = await joinAuction(auction!.id, input);
    setViewer({ role: "student", studentId: s.id });
    toast(`You're in, ${s.displayName}`);
    router.push(`/a/${slug}/ask`);
  }

  async function addSquad() {
    if (!teamId || squadName.trim().length < 2) return;
    const sq = await createSquad(teamId, squadName, "users", null);
    setSquadId(sq.id);
    setSquadName("");
    setCreating(false);
    toast(`${sq.name} created`);
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} watermark>
        <Headline highlight="side.">Pick your</Headline>
        <HeaderSubtitle>
          {auction.name} · Your grade is your team. Join a squad, or go solo and still count for your grade.
        </HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        <TextField
          label="Your name"
          icon={<UsersRound />}
          placeholder="Olivia S."
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.displayName}
          hint="First name and last initial only."
        />

        <section>
          <SectionLabel>Pick your grade</SectionLabel>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Grade">
            {[...grades, ...(faculty ? [faculty] : [])].map((t) => {
              const on = t.id === teamId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setTeamId(t.id);
                    setSquadId(null);
                  }}
                  className={cn(
                    "rounded-card border-[1.5px] px-3 py-3.5 text-center transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                    t.kind === "faculty" && "col-span-2",
                    on ? "border-lime-400 bg-lime-400 text-navy-900" : "border-border bg-card text-navy-900 hover:border-teal-500",
                  )}
                >
                  <div className="font-display text-lg font-bold tracking-[-0.02em]">{t.name}</div>
                  <div className={cn("text-sm", on ? "text-navy-800" : "text-ink-500")}>
                    {t.kind === "faculty" ? "Teachers compete too" : t.label}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.teamId ? <p className="mt-1.5 text-sm font-medium text-red-700">{errors.teamId}</p> : null}
        </section>

        {team && team.kind === "grade" ? (
          <section className="animate-fade-in">
            <SectionLabel aside="optional">Squad in {team.name}</SectionLabel>
            {squads && squads.length > 0 ? (
              <ListCard role="radiogroup" aria-label="Squad">
                {squads.map((sq) => {
                  const I = SQUAD_ICONS[sq.icon] ?? SQUAD_ICONS.users;
                  return (
                    <ListRow
                      key={sq.id}
                      role="radio"
                      selected={sq.id === squadId}
                      onClick={() => setSquadId(sq.id === squadId ? null : sq.id)}
                      leading={
                        <IconTile tone={I.tone}>
                          <I.icon />
                        </IconTile>
                      }
                      title={sq.name}
                      meta={`${sq.memberCount} member${sq.memberCount === 1 ? "" : "s"}`}
                    />
                  );
                })}
              </ListCard>
            ) : (
              <p className="rounded-card border border-dashed border-border px-4 py-5 text-center text-ink-500">
                No squads in {team.name} yet. Start one!
              </p>
            )}
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {auction.allowCustomSquads && team?.kind === "grade" ? (
            <SecondaryButton onClick={() => setCreating(true)}>+ Create a squad</SecondaryButton>
          ) : (
            <span />
          )}
          <SecondaryButton variant="navy" arrow onClick={() => join(!squadId)}>
            {squadId ? "Join squad" : "Go solo"}
          </SecondaryButton>
        </div>

        <Callout>Your team&apos;s performance is normalized, so every grade has a fair shot.</Callout>
      </PageBody>

      <BottomSheet open={creating} onClose={() => setCreating(false)} title="Name your squad">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            addSquad();
          }}
        >
          <p className="text-ink-500">A team, a club, a friend group. Squad points roll up to {team?.name}.</p>
          <TextField label="Squad name" placeholder="Debate Club" value={squadName} onChange={(e) => setSquadName(e.target.value)} maxLength={30} />
          <PrimaryButton type="submit" variant="gradient">
            Create squad
          </PrimaryButton>
        </form>
      </BottomSheet>
    </Screen>
  );
}
