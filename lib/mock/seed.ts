/**
 * Phase 1 seed data. Reuse it for the Phase 2 seed script.
 *
 * Demo story (from the mockups): "Branson Fall Auction" for the SF-Marin Food Bank,
 * student Olivia S. (Class of 2027, Girls Soccer), approver Ms. Okafor, @bransonschool.
 *
 * Businesses are made up (open question 8: don't use a real business's name or
 * logo without its permission). The mockups' numbers are illustrative; the counts
 * here follow the real scoring rules instead.
 *
 * Dates are relative to `now` so the auction is always live when the demo loads.
 */

import { defaultGradeTeams } from "../school-year";
import type { Bid, Bidder, Business, DB, Item, ItemView, Post, Squad, Student, Team, Win } from "../types";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const DEMO = {
  auctionSlug: "branson",
  /** The student we follow through the story. */
  studentSlug: "olivia",
  studentId: "stu-olivia",
  /** The bidder "you" are in the bidder views. Leads the dinner until Coach Daniels outbids. */
  bidderId: "bdr-jamie",
  /** Who outbids you in the demo (screen 10). */
  rivalBidderId: "bdr-daniels",
  /** Screen 09/10 item. */
  bidItemId: "itm-dinner4",
  /** Screen 06/07/08 item. */
  postItemId: "itm-pizza10",
  /** Business dashboard for Redwood Slice Co. (screen 08). */
  businessToken: "biz_demo_redwood_9f3c1a7e5b2d4c6f8a0b1c2d3e4f5a6b",
  /** Business with the paid win, for scan & redeem (screen 14). */
  redeemBusinessToken: "biz_demo_bluefin_4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d",
  /** Prize pass for the paid win (screen 13). */
  passToken: "pass_demo_7f1e3d5c7b9a1e3d5c7b9a1e3d5c7b9a",
} as const;

export function buildSeed(now: Date = new Date()): DB {
  const t = now.getTime();
  const iso = (ms: number) => new Date(ms).toISOString();
  const day = (ms: number) => iso(ms).slice(0, 10);
  const created = iso(t - 12 * DAY);

  // ── Auction ────────────────────────────────────────────────────────────
  const auctionId = "auc-branson";
  const auction = {
    id: auctionId,
    createdAt: iso(t - 20 * DAY),
    slug: DEMO.auctionSlug,
    name: "Branson Fall Auction",
    schoolName: "Branson",
    opensAt: iso(t - 12 * DAY),
    closesAt: iso(t + 6 * DAY + 4 * HOUR),
    status: "live" as const,
    nonprofitSlug: "sf-marin-food-bank",
    nonprofitName: "SF-Marin Food Bank",
    nonprofitEin: "00-0000001",
    everyorgFundraiserId: null,
    allowCustomSquads: true,
    minIncrementCents: 1000,
    socialHandle: "@bransonschool",
    approverName: "Ms. Okafor",
    reachFamilies: 430,
    reachFollowers: 6200,
    organizerId: "usr-okafor",
  };

  // ── Teams: four grades + Faculty & Staff ───────────────────────────────
  const grades = defaultGradeTeams(now);
  const teamIds = ["team-seniors", "team-juniors", "team-sophomores", "team-freshmen"];
  const teams: Team[] = [
    ...grades.map((g, i) => ({
      id: teamIds[i]!,
      createdAt: created,
      auctionId,
      name: g.name,
      label: g.label,
      kind: "grade" as const,
      classYear: g.classYear,
      sortOrder: g.sortOrder,
    })),
    {
      id: "team-faculty",
      createdAt: created,
      auctionId,
      name: "Faculty & Staff",
      label: "Faculty & Staff",
      kind: "faculty",
      classYear: null,
      sortOrder: 4,
    },
  ];

  // ── Squads (all in the senior class, as in screen 03) ──────────────────
  const squads: Squad[] = [
    { id: "sq-soccer", createdAt: created, teamId: "team-seniors", name: "Girls Soccer", icon: "ball", createdBy: "stu-maya" },
    { id: "sq-robotics", createdAt: created, teamId: "team-seniors", name: "Robotics", icon: "sparkle", createdBy: "stu-dev" },
    { id: "sq-jazz", createdAt: created, teamId: "team-seniors", name: "Jazz Band", icon: "star", createdBy: "stu-sam" },
  ];

  // ── Students: first name + last initial only ───────────────────────────
  const student = (id: string, displayName: string, teamId: string, squadId: string | null): Student => ({
    id,
    createdAt: created,
    auctionId,
    teamId,
    squadId,
    displayName,
    slug: displayName.split(" ")[0]!.toLowerCase(),
    userId: null,
  });
  const students: Student[] = [
    student("stu-olivia", "Olivia S.", "team-seniors", "sq-soccer"),
    student("stu-maya", "Maya R.", "team-seniors", "sq-soccer"),
    student("stu-dev", "Dev K.", "team-seniors", "sq-robotics"),
    student("stu-sam", "Sam P.", "team-seniors", "sq-jazz"),
    student("stu-leo", "Leo M.", "team-seniors", null),
    student("stu-ava", "Ava C.", "team-juniors", null),
    student("stu-noah", "Noah B.", "team-sophomores", null),
    student("stu-zoe", "Zoe L.", "team-freshmen", null),
    student("stu-alvarez", "Mr. Alvarez", "team-faculty", null),
  ];

  // ── Businesses (fictional) ─────────────────────────────────────────────
  const business = (
    id: string,
    name: string,
    token: string,
    phone: string,
    address: string,
    referredBy: string,
  ): Business => ({
    id,
    createdAt: created,
    auctionId,
    name,
    logoPath: null,
    phone,
    address,
    dashboardToken: token,
    referredByStudentId: referredBy,
  });
  const businesses: Business[] = [
    business("biz-redwood", "Redwood Slice Co.", DEMO.businessToken, "(415) 555-0142", "12 Magnolia Ave, Larkspur, CA 94939", "stu-olivia"),
    business("biz-bluefin", "Blue Fin Burger Bar", DEMO.redeemBusinessToken, "(415) 555-0168", "6 Harbor Way, Corte Madera, CA 94925", "stu-olivia"),
    business("biz-tide", "Morning Tide Coffee", "biz_demo_tide_1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a", "(415) 555-0119", "88 Bon Air Rd, Greenbrae, CA 94904", "stu-maya"),
    business("biz-summit", "Summit Climbing Gym", "biz_demo_summit_2c4e6a8b0d2f4a6c8e0b2d4f6a8c0e2b", "(415) 555-0177", "410 Bel Marin Keys, Novato, CA 94949", "stu-dev"),
    business("biz-bayside", "Bayside Guitar Studio", "biz_demo_bayside_3d5f7b9c1e3a5c7e9b1d3f5a7c9e1b3d", "(415) 555-0133", "21 Throckmorton Ave, Mill Valley, CA 94941", "stu-sam"),
    business("biz-petal", "Petal & Stem Florist", "biz_demo_petal_4e6a8c0d2f4b6d8f0a2c4e6b8d0f2a4c", "(415) 555-0191", "305 Miller Ave, Mill Valley, CA 94941", "stu-ava"),
  ];

  // ── Items ──────────────────────────────────────────────────────────────
  const item = (p: Omit<Item, "createdAt" | "auctionId" | "photoPath" | "currentBidCents" | "bidCount" | "leadingBidderId">): Item => ({
    ...p,
    createdAt: created,
    auctionId,
    photoPath: null,
    currentBidCents: null,
    bidCount: 0,
    leadingBidderId: null,
  });
  const items: Item[] = [
    item({
      id: DEMO.postItemId,
      businessId: "biz-redwood",
      studentId: "stu-olivia",
      title: "Pizza party for 10",
      description: "Two large pies, salad, drinks, and the back room is yours for two hours.",
      artIcon: "pizza",
      retailValueCents: 15000,
      uses: 1,
      validDays: 90,
      startingBidCents: 6000,
      status: "live",
    }),
    item({
      id: DEMO.bidItemId,
      businessId: "biz-bluefin",
      studentId: "stu-olivia",
      title: "Dinner for 4",
      description: "A burger dinner for four at Blue Fin Burger Bar in Corte Madera.",
      artIcon: "burger",
      retailValueCents: 15000,
      uses: 1,
      validDays: 90,
      startingBidCents: 6000,
      status: "live",
    }),
    item({
      id: "itm-coffee",
      businessId: "biz-tide",
      studentId: "stu-maya",
      title: "A month of coffee",
      description: "One drink a day for 30 days, any size, any milk.",
      artIcon: "coffee",
      retailValueCents: 9000,
      uses: 30,
      validDays: 120,
      startingBidCents: 4000,
      status: "live",
    }),
    item({
      id: "itm-climb",
      businessId: "biz-summit",
      studentId: "stu-dev",
      title: "Climbing day for 2",
      description: "Day passes, shoe rental and an intro belay lesson for two.",
      artIcon: "climb",
      retailValueCents: 20000,
      uses: 1,
      validDays: 180,
      startingBidCents: 8000,
      status: "live",
    }),
    item({
      id: "itm-guitar",
      businessId: "biz-bayside",
      studentId: "stu-sam",
      title: "Four guitar lessons",
      description: "Four 45-minute private lessons, any level, guitar provided.",
      artIcon: "guitar",
      retailValueCents: 24000,
      uses: 4,
      validDays: 180,
      startingBidCents: 10000,
      status: "live",
    }),
    item({
      id: "itm-flowers",
      businessId: "biz-petal",
      studentId: "stu-ava",
      title: "Three months of flowers",
      description: "A fresh seasonal bouquet delivered on the first of each month.",
      artIcon: "flower",
      retailValueCents: 12000,
      uses: 3,
      validDays: 120,
      startingBidCents: 5000,
      status: "live",
    }),
    item({
      id: "itm-pizza-class",
      businessId: "biz-redwood",
      studentId: "stu-noah",
      title: "Pizza-making class for 6",
      description: "Toss your own dough with our head chef, then eat what you make.",
      artIcon: "pizza",
      retailValueCents: 18000,
      uses: 1,
      validDays: 120,
      startingBidCents: 7000,
      status: "pending",
    }),
    item({
      id: "itm-burger2",
      businessId: "biz-bluefin",
      studentId: "stu-alvarez",
      title: "Burger night for 2",
      description: "Two burgers, fries and shakes. Closed early as a demo of the winner flow.",
      artIcon: "burger",
      retailValueCents: 6000,
      uses: 1,
      validDays: 180,
      startingBidCents: 2500,
      status: "paid",
    }),
  ];

  // ── Bidders ────────────────────────────────────────────────────────────
  const bidder = (id: string, displayName: string, town: string, phone: string): Bidder => ({
    id,
    createdAt: created,
    userId: null,
    displayName,
    town,
    phone,
    smsOptIn: true,
  });
  const bidders: Bidder[] = [
    bidder("bdr-jamie", "Jamie T.", "Ross", "+14155550101"),
    bidder("bdr-evan", "Evan W.", "Kentfield", "+14155550102"),
    bidder("bdr-caroline", "Caroline G.", "Larkspur", "+14155550103"),
    bidder("bdr-daniels", "Coach Daniels", "Mill Valley", "+14155550104"),
    bidder("bdr-patel", "Patel family", "San Anselmo", "+14155550105"),
    bidder("bdr-rosa", "Rosa M.", "Corte Madera", "+14155550106"),
  ];

  // ── Bids: $10 steps from the starting bid, oldest first ────────────────
  const bids: Bid[] = [];
  const ladder = (itemId: string, from: number, to: number, who: string[], lastMinutesAgo: number[]) => {
    const steps = (to - from) / 1000 + 1;
    for (let i = 0; i < steps; i++) {
      const fromEnd = steps - 1 - i;
      const scripted = lastMinutesAgo[lastMinutesAgo.length - 1 - fromEnd];
      // Bids before the scripted ones are spaced 90 minutes apart, further back.
      const minutesAgo = scripted ?? (lastMinutesAgo[0] ?? 0) + 90 * (fromEnd - lastMinutesAgo.length + 1);
      bids.push({
        id: `bid-${itemId}-${i + 1}`,
        createdAt: iso(t - minutesAgo * MIN),
        itemId,
        bidderId: who[i % who.length]!,
        amountCents: from + i * 1000,
      });
    }
  };
  // Screen 09: Caroline $120 (46 min ago), Evan $130 (14 min), Jamie $140 (2 min).
  ladder(DEMO.bidItemId, 6000, 14000, ["bdr-rosa", "bdr-evan", "bdr-patel", "bdr-caroline", "bdr-daniels", "bdr-rosa", "bdr-caroline", "bdr-evan", "bdr-jamie"], [46, 14, 2]);
  ladder(DEMO.postItemId, 6000, 14000, ["bdr-caroline", "bdr-patel", "bdr-rosa", "bdr-evan", "bdr-jamie", "bdr-daniels"], [95, 40, 9]);
  ladder("itm-coffee", 4000, 7000, ["bdr-rosa", "bdr-caroline"], [300, 120]);
  ladder("itm-climb", 8000, 12000, ["bdr-evan", "bdr-daniels", "bdr-patel"], [500, 210, 33]);
  ladder("itm-guitar", 10000, 15000, ["bdr-jamie", "bdr-rosa", "bdr-patel"], [700, 380, 61]);
  ladder("itm-flowers", 5000, 5000, ["bdr-caroline"], [1440]);
  ladder("itm-burger2", 2500, 7500, ["bdr-evan", "bdr-rosa", "bdr-patel"], [4000, 3000, 2900]);

  // Denormalised current bid / count / leader, as place_bid will maintain them.
  for (const it of items) {
    const its = bids.filter((b) => b.itemId === it.id);
    const top = its[its.length - 1];
    it.bidCount = its.length;
    it.currentBidCents = top?.amountCents ?? null;
    it.leadingBidderId = top?.bidderId ?? null;
  }

  // ── Posts ──────────────────────────────────────────────────────────────
  const post = (p: Omit<Post, "createdAt" | "reviewedBy" | "postedUrl" | "channel" | "postedOn" | "views"> & Partial<Post>): Post => ({
    createdAt: iso(t - 5 * DAY),
    reviewedBy: null,
    postedUrl: null,
    channel: null,
    postedOn: null,
    views: 0,
    ...p,
  });
  const thursdayOffset = daysSinceWeekday(now, 4); // most recent Thursday
  const posts: Post[] = [
    post({
      id: "post-pizza-story",
      itemId: DEMO.postItemId,
      studentId: "stu-olivia",
      format: "story",
      caption: "Redwood Slice Co. just donated a pizza party for 10 to our auction. Bid now, outbid your friends, feed Marin. Link in bio.",
      status: "posted",
      reviewedBy: "Ms. Okafor",
      postedUrl: "https://instagram.com/stories/bransonschool/demo1",
      channel: "@bransonschool story",
      postedOn: day(t - thursdayOffset * DAY),
      views: 1900,
    }),
    post({
      id: "post-pizza-feed",
      itemId: DEMO.postItemId,
      studentId: "stu-maya",
      format: "feed",
      caption: "Pizza party for 10, courtesy of Redwood Slice Co. Current bid is climbing. Every dollar to the SF-Marin Food Bank.",
      status: "posted",
      reviewedBy: "Ms. Okafor",
      postedUrl: "https://instagram.com/p/demo2",
      channel: "@bransongirlssoccer feed",
      postedOn: day(t - Math.max(0, thursdayOffset - 1) * DAY),
      views: 840,
    }),
    post({
      id: "post-dinner-story",
      itemId: DEMO.bidItemId,
      studentId: "stu-olivia",
      format: "story",
      caption: "Dinner for 4 at Blue Fin Burger Bar is up for grabs. Bid now, outbid your friends, feed Marin. Link in bio.",
      status: "pending",
      createdAt: iso(t - 3 * HOUR),
    }),
    post({
      id: "post-climb-feed",
      itemId: "itm-climb",
      studentId: "stu-dev",
      format: "feed",
      caption: "Summit Climbing Gym donated a climbing day for 2. Robotics says: reach for it. Link in bio.",
      status: "approved",
      reviewedBy: "Ms. Okafor",
    }),
  ];

  // ── Item views: last 7 days, Thursday spike on the pizza item ──────────
  const itemViews: ItemView[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = day(t - d * DAY);
    const isThursday = d === thursdayOffset;
    const base = [210, 260, 200, 520, 470, 640, 300][d]!;
    itemViews.push({
      id: `view-pizza-${d}`,
      createdAt: iso(t - d * DAY),
      itemId: DEMO.postItemId,
      source: isThursday ? "post" : "direct",
      viewedOn: date,
      count: isThursday ? 1900 : base,
    });
    itemViews.push({
      id: `view-dinner-${d}`,
      createdAt: iso(t - d * DAY),
      itemId: DEMO.bidItemId,
      source: "direct",
      viewedOn: date,
      count: Math.round(base * 0.8),
    });
  }

  // ── The one win: paid, with an active prize pass ───────────────────────
  const paidAt = t - 2 * DAY;
  const wins: Win[] = [
    {
      id: "win-burger2",
      createdAt: iso(paidAt - HOUR),
      itemId: "itm-burger2",
      bidderId: "bdr-patel",
      amountCents: 7500,
      paymentStatus: "paid",
      everyorgChargeId: "demo_charge_1",
      paidAt: iso(paidAt),
      passToken: DEMO.passToken,
      expiresOn: day(paidAt + 180 * DAY),
      usesRemaining: 1,
    },
  ];

  return {
    auctions: [auction],
    teams,
    squads,
    students,
    businesses,
    items,
    bidders,
    bids,
    posts,
    itemViews,
    wins,
    redemptions: [],
    notifications: [],
  };
}

/** Days back from `now` to the most recent given weekday (0 = Sunday … 6 = Saturday). */
function daysSinceWeekday(now: Date, weekday: number) {
  return (now.getDay() - weekday + 7) % 7;
}
