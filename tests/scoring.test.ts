import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/mock/seed";
import { BID_POINTS, ITEM_POINTS, squadScores, studentScores, teamScores } from "@/lib/scoring";
import { seniorClassYear } from "@/lib/school-year";

const now = new Date("2026-11-13T12:00:00Z");
const db = buildSeed(now);
const scores = studentScores(db.students, db.items, db.bids);
const pts = (id: string) => scores.find((s) => s.studentId === id)!.points;

describe("student scores", () => {
  it("counts approved items and the bids on them", () => {
    // Olivia secured pizza (9 bids) and dinner (9 bids).
    expect(pts("stu-olivia")).toBe(2 * ITEM_POINTS + 18 * BID_POINTS);
    // Maya: coffee, 4 bids.
    expect(pts("stu-maya")).toBe(ITEM_POINTS + 4 * BID_POINTS);
  });

  it("ignores pending items", () => {
    // Noah's pizza class is pending.
    expect(pts("stu-noah")).toBe(0);
  });

  it("counts paid items", () => {
    // Mr. Alvarez: burger night, paid, 6 bids.
    expect(pts("stu-alvarez")).toBe(ITEM_POINTS + 6 * BID_POINTS);
  });
});

describe("squad and team scores", () => {
  const seniors = db.teams.find((t) => t.id === "team-seniors")!;

  it("divides by member count and adds a Solo squad", () => {
    const sq = squadScores(seniors, db.squads, scores);
    const soccer = sq.find((s) => s.id === "sq-soccer")!;
    expect(soccer.members).toBe(2);
    expect(soccer.perPerson).toBe((38 + 14) / 2);
    const solo = sq.find((s) => s.isSolo)!;
    expect(solo.name).toBe("Solo seniors");
    expect(solo.members).toBe(1); // Leo
    expect(sq[0]!.perPerson).toBeGreaterThanOrEqual(sq[sq.length - 1]!.perPerson);
  });

  it("ranks teams by points per person", () => {
    const t = teamScores(db.teams, scores);
    expect(t).toHaveLength(5);
    // Seniors: Olivia 38 + Maya 14 + Dev 15 + Sam 16 + Leo 0 = 83 over 5.
    expect(t.find((x) => x.id === "team-seniors")!.perPerson).toBe(16.6);
    for (let i = 1; i < t.length; i++) expect(t[i - 1]!.perPerson).toBeGreaterThanOrEqual(t[i]!.perPerson);
  });
});

describe("school year", () => {
  it("rolls over in August", () => {
    expect(seniorClassYear(new Date(2026, 10, 13))).toBe(2027);
    expect(seniorClassYear(new Date(2027, 4, 1))).toBe(2027);
    expect(seniorClassYear(new Date(2027, 7, 1))).toBe(2028);
  });
});
