/**
 * Leaderboard scoring. Tune the constants here; nothing else hard-codes them.
 *
 * Student points = ITEM_POINTS per approved item they secured
 *                + BID_POINTS per bid on those items.
 * Squad and team score = total member points ÷ member count ("pts/person").
 * Students without a squad roll into a virtual "Solo" squad for their grade.
 *
 * In Phase 2 these become Postgres views (student_scores, squad_scores, team_scores);
 * the functions below are the reference implementation the views must match.
 */

import type { Bid, Item, Squad, Student, Team } from "./types";

export const ITEM_POINTS = 10;
export const BID_POINTS = 1;

/** Item statuses that count as "approved" for scoring. */
const SCORED_STATUSES = new Set<Item["status"]>(["live", "closed", "paid", "redeemed"]);

export type StudentScore = {
  studentId: string;
  teamId: string;
  squadId: string | null;
  items: number;
  bids: number;
  points: number;
};

export type GroupScore = {
  id: string;
  name: string;
  members: number;
  items: number;
  bids: number;
  totalPoints: number;
  /** Points per person, the ranking key. 0 for empty groups. */
  perPerson: number;
};

export type SquadScore = GroupScore & { teamId: string; isSolo: boolean; icon: Squad["icon"] | "solo" };
export type TeamScore = GroupScore & { label: string; kind: Team["kind"]; sortOrder: number };

export function studentScores(students: Student[], items: Item[], bids: Bid[]): StudentScore[] {
  const bidsByItem = new Map<string, number>();
  for (const b of bids) bidsByItem.set(b.itemId, (bidsByItem.get(b.itemId) ?? 0) + 1);

  const byStudent = new Map<string, { items: number; bids: number }>();
  for (const it of items) {
    if (!it.studentId || !SCORED_STATUSES.has(it.status)) continue;
    const s = byStudent.get(it.studentId) ?? { items: 0, bids: 0 };
    s.items += 1;
    s.bids += bidsByItem.get(it.id) ?? 0;
    byStudent.set(it.studentId, s);
  }

  return students
    .map((st) => {
      const s = byStudent.get(st.id) ?? { items: 0, bids: 0 };
      return {
        studentId: st.id,
        teamId: st.teamId,
        squadId: st.squadId,
        items: s.items,
        bids: s.bids,
        points: s.items * ITEM_POINTS + s.bids * BID_POINTS,
      };
    })
    .sort((a, b) => b.points - a.points);
}

function group(id: string, name: string, members: StudentScore[]): GroupScore {
  const totalPoints = members.reduce((n, m) => n + m.points, 0);
  return {
    id,
    name,
    members: members.length,
    items: members.reduce((n, m) => n + m.items, 0),
    bids: members.reduce((n, m) => n + m.bids, 0),
    totalPoints,
    perPerson: members.length ? round1(totalPoints / members.length) : 0,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const soloSquadId = (teamId: string) => `solo:${teamId}`;

/** Squads within one team, including the virtual Solo squad, ranked by pts/person. */
export function squadScores(team: Team, squads: Squad[], scores: StudentScore[]): SquadScore[] {
  const members = scores.filter((s) => s.teamId === team.id);
  const rows: SquadScore[] = squads
    .filter((sq) => sq.teamId === team.id)
    .map((sq) => ({
      ...group(
        sq.id,
        sq.name,
        members.filter((m) => m.squadId === sq.id),
      ),
      teamId: team.id,
      isSolo: false,
      icon: sq.icon,
    }));
  const solo = members.filter((m) => !m.squadId);
  if (solo.length) {
    rows.push({
      ...group(soloSquadId(team.id), `Solo ${team.kind === "faculty" ? "staff" : team.label.toLowerCase()}`, solo),
      teamId: team.id,
      isSolo: true,
      icon: "solo",
    });
  }
  return rows.sort((a, b) => b.perPerson - a.perPerson || b.totalPoints - a.totalPoints);
}

/** All teams ranked by pts/person. Ties break on total points, then sort order. */
export function teamScores(teams: Team[], scores: StudentScore[]): TeamScore[] {
  return teams
    .map((t) => ({
      ...group(
        t.id,
        t.name,
        scores.filter((s) => s.teamId === t.id),
      ),
      label: t.label,
      kind: t.kind,
      sortOrder: t.sortOrder,
    }))
    .sort((a, b) => b.perPerson - a.perPerson || b.totalPoints - a.totalPoints || a.sortOrder - b.sortOrder);
}
