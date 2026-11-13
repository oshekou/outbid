/**
 * Every read and write the UI does goes through these functions.
 * Phase 1: backed by the in-memory/localStorage mock store.
 * Phase 2: same signatures, backed by Supabase (place_bid becomes a Postgres function).
 *
 * All functions are async so callers don't change when the backend does.
 */

import { z } from "zod";
import { MOCK_NONPROFITS } from "../mock/nonprofits";
import { defaultGradeTeams } from "../school-year";
import { squadScores, studentScores, teamScores, type SquadScore, type StudentScore, type TeamScore } from "../scoring";
import type {
  Auction,
  Bid,
  Bidder,
  Business,
  Item,
  ItemView,
  Nonprofit,
  Post,
  PostFormat,
  Redemption,
  Squad,
  SquadIcon,
  Student,
  Team,
  Win,
} from "../types";
import { getDB, mutate, newId, newToken } from "./store";

export { resetDB, subscribe, getVersion } from "./store";

// ── Errors ───────────────────────────────────────────────────────────────

export class DataError extends Error {
  constructor(
    public code:
      | "not_found"
      | "auction_closed"
      | "bid_too_low"
      | "not_live"
      | "invalid"
      | "pass_unpaid"
      | "pass_expired"
      | "pass_used"
      | "wrong_business",
    message: string,
  ) {
    super(message);
  }
}

const nowISO = () => new Date().toISOString();

function must<T>(v: T | undefined, what: string): T {
  if (v === undefined) throw new DataError("not_found", `${what} not found`);
  return v;
}

// ── Auctions & teams ─────────────────────────────────────────────────────

export async function getAuction(slug: string): Promise<Auction | null> {
  return getDB().auctions.find((a) => a.slug === slug) ?? null;
}

/** True while bids are accepted: status live and before closesAt. */
export function isAuctionOpen(a: Auction, at: Date = new Date()) {
  return a.status === "live" && at.getTime() < new Date(a.closesAt).getTime() && at.getTime() >= new Date(a.opensAt).getTime();
}

export async function listTeams(auctionId: string): Promise<Team[]> {
  return getDB()
    .teams.filter((t) => t.auctionId === auctionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listSquads(teamId: string): Promise<(Squad & { memberCount: number })[]> {
  const db = getDB();
  return db.squads
    .filter((s) => s.teamId === teamId)
    .map((s) => ({ ...s, memberCount: db.students.filter((st) => st.squadId === s.id).length }))
    .sort((a, b) => b.memberCount - a.memberCount);
}

export const createAuctionInput = z.object({
  name: z.string().trim().min(3).max(80),
  schoolName: z.string().trim().min(2).max(80),
  opensAt: z.iso.datetime(),
  closesAt: z.iso.datetime(),
  nonprofit: z.object({ slug: z.string(), name: z.string(), ein: z.string() }),
});

export async function searchNonprofits(query: string): Promise<Nonprofit[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const words = q.split(/\s+/);
  return MOCK_NONPROFITS.filter((n) => {
    const hay = `${n.name} ${n.location}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }).slice(0, 8);
}

export async function updateAuction(
  auctionId: string,
  patch: Partial<Pick<Auction, "name" | "opensAt" | "closesAt" | "nonprofitSlug" | "nonprofitName" | "nonprofitEin" | "allowCustomSquads" | "socialHandle" | "approverName" | "status">>,
): Promise<Auction> {
  return mutate((db) => {
    const a = must(db.auctions.find((x) => x.id === auctionId), "Auction");
    Object.assign(a, patch);
    return { ...a };
  });
}

// ── Students ─────────────────────────────────────────────────────────────

export async function getStudent(auctionId: string, slug: string): Promise<Student | null> {
  return getDB().students.find((s) => s.auctionId === auctionId && s.slug === slug) ?? null;
}

export async function getStudentById(id: string): Promise<Student | null> {
  return getDB().students.find((s) => s.id === id) ?? null;
}

export const joinInput = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter your first name and last initial")
    .max(40)
    .regex(/^[\p{L}'’-]+(\s[\p{L}]\.?)?$/u, "First name and last initial only, like “Olivia S.”"),
  teamId: z.string().min(1, "Pick your grade"),
  squadId: z.string().nullable(),
});

/** Student joins via the auction's join link. Phase 2 also creates an anonymous session. */
export async function joinAuction(auctionId: string, input: z.input<typeof joinInput>): Promise<Student> {
  const data = joinInput.parse(input);
  return mutate((db) => {
    const first = data.displayName.split(" ")[0]!.toLowerCase().replace(/[^a-z0-9]/g, "") || "student";
    let slug = first;
    for (let n = 2; db.students.some((s) => s.auctionId === auctionId && s.slug === slug); n++) slug = `${first}${n}`;
    const s: Student = {
      id: newId("stu"),
      createdAt: nowISO(),
      auctionId,
      teamId: data.teamId,
      squadId: data.squadId,
      displayName: normaliseName(data.displayName),
      slug,
      userId: null,
    };
    db.students.push(s);
    return s;
  });
}

function normaliseName(name: string) {
  const [first, last] = name.trim().split(/\s+/);
  const f = first!.charAt(0).toUpperCase() + first!.slice(1);
  return last ? `${f} ${last.charAt(0).toUpperCase()}.` : f;
}

export async function createSquad(teamId: string, name: string, icon: SquadIcon, createdBy: string | null): Promise<Squad> {
  const clean = z.string().trim().min(2).max(30).parse(name);
  return mutate((db) => {
    const sq: Squad = { id: newId("sq"), createdAt: nowISO(), teamId, name: clean, icon, createdBy };
    db.squads.push(sq);
    return sq;
  });
}

// ── Businesses & items ───────────────────────────────────────────────────

export async function getBusinessByToken(token: string): Promise<Business | null> {
  return getDB().businesses.find((b) => b.dashboardToken === token) ?? null;
}

export async function getBusiness(id: string): Promise<Business | null> {
  return getDB().businesses.find((b) => b.id === id) ?? null;
}

export async function listItems(auctionId: string, opts: { includePending?: boolean } = {}): Promise<Item[]> {
  return getDB()
    .items.filter((i) => i.auctionId === auctionId && (opts.includePending || i.status !== "pending"))
    .sort((a, b) => b.bidCount - a.bidCount);
}

export async function listItemsForBusiness(businessId: string): Promise<Item[]> {
  return getDB().items.filter((i) => i.businessId === businessId);
}

export async function getItem(itemId: string): Promise<Item | null> {
  return getDB().items.find((i) => i.id === itemId) ?? null;
}

export const donateInput = z.object({
  businessName: z.string().trim().min(2, "Enter your business name").max(80),
  title: z.string().trim().min(3, "What are you donating?").max(80),
  retailValueCents: z.number().int().min(500, "Retail value must be at least $5").max(10_000_00),
  uses: z.number().int().min(1).max(100),
  validDays: z.number().int().min(7).max(730),
  description: z.string().trim().min(5, "Add one line for the post").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{10,20}$/, "Enter a phone number we can text the dashboard link to"),
  photoPath: z.string().nullable().default(null),
  logoPath: z.string().nullable().default(null),
});

/** Default starting bid: 40% of retail, rounded to the nearest $5 (open question 5). */
export function defaultStartingBid(retailCents: number) {
  return Math.max(500, Math.round((retailCents * 0.4) / 500) * 500);
}

/**
 * A business donates an item from a student's ask link.
 * Creates the business (or reuses it by name) and a pending item credited to the student.
 * Returns the dashboard token that would be texted to them.
 */
export async function donateItem(
  auctionId: string,
  studentId: string | null,
  input: z.input<typeof donateInput>,
): Promise<{ business: Business; item: Item }> {
  const data = donateInput.parse(input);
  return mutate((db) => {
    let business = db.businesses.find(
      (b) => b.auctionId === auctionId && b.name.toLowerCase() === data.businessName.toLowerCase(),
    );
    if (!business) {
      business = {
        id: newId("biz"),
        createdAt: nowISO(),
        auctionId,
        name: data.businessName,
        logoPath: data.logoPath,
        phone: data.phone,
        address: null,
        dashboardToken: newToken("biz"),
        referredByStudentId: studentId,
      };
      db.businesses.push(business);
    }
    const item: Item = {
      id: newId("itm"),
      createdAt: nowISO(),
      auctionId,
      businessId: business.id,
      studentId,
      title: data.title,
      description: data.description,
      photoPath: data.photoPath,
      artIcon: guessArt(`${data.title} ${data.businessName}`),
      retailValueCents: data.retailValueCents,
      uses: data.uses,
      validDays: data.validDays,
      startingBidCents: defaultStartingBid(data.retailValueCents),
      status: "pending",
      currentBidCents: null,
      bidCount: 0,
      leadingBidderId: null,
    };
    db.items.push(item);
    return { business: { ...business }, item: { ...item } };
  });
}

/** Organizer approves or rejects a donated item (open question 7). */
export async function reviewItem(itemId: string, approve: boolean): Promise<Item> {
  return mutate((db) => {
    const it = must(db.items.find((i) => i.id === itemId), "Item");
    if (approve) it.status = "live";
    else db.items.splice(db.items.indexOf(it), 1);
    return { ...it };
  });
}

/** Pick placeholder art from the item's words until real photos are uploaded. */
export function guessArt(text: string): Item["artIcon"] {
  const t = text.toLowerCase();
  if (/burger|dinner|lunch|restaurant|grill|bbq/.test(t)) return "burger";
  if (/coffee|cafe|café|tea|espresso|bakery/.test(t)) return "coffee";
  if (/climb|hike|gym|yoga|fitness|surf|ski/.test(t)) return "climb";
  if (/guitar|music|piano|lesson|concert|band/.test(t)) return "guitar";
  if (/flower|plant|garden|florist/.test(t)) return "flower";
  if (/bowl|game|arcade|golf/.test(t)) return "bowling";
  if (/sail|boat|kayak|paddle|beach/.test(t)) return "sail";
  return "pizza";
}

/** An item with everything a screen needs around it. */
export type ItemDetail = {
  item: Item;
  auction: Auction;
  business: Business;
  student: Student | null;
  team: Team | null;
};

export async function getItemDetail(itemId: string): Promise<ItemDetail | null> {
  const db = getDB();
  const item = db.items.find((i) => i.id === itemId);
  if (!item) return null;
  const auction = db.auctions.find((a) => a.id === item.auctionId)!;
  const business = db.businesses.find((b) => b.id === item.businessId)!;
  const student = db.students.find((s) => s.id === item.studentId) ?? null;
  const team = student ? (db.teams.find((t) => t.id === student.teamId) ?? null) : null;
  return { item: { ...item }, auction, business, student, team };
}

export async function listItemDetails(auctionId: string, opts: { includePending?: boolean } = {}): Promise<ItemDetail[]> {
  const items = await listItems(auctionId, opts);
  return (await Promise.all(items.map((i) => getItemDetail(i.id)))).filter((x): x is ItemDetail => !!x);
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return getDB().teams.find((t) => t.id === teamId) ?? null;
}

export async function getSquad(squadId: string | null): Promise<Squad | null> {
  if (!squadId) return null;
  return getDB().squads.find((s) => s.id === squadId) ?? null;
}

/** A student's points, items and rank within their grade. */
export async function getStudentSummary(studentId: string) {
  const db = getDB();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return null;
  const team = db.teams.find((t) => t.id === student.teamId)!;
  const squad = db.squads.find((q) => q.id === student.squadId) ?? null;
  const board = await getLeaderboard(student.auctionId);
  const inTeam = board.students.filter((s) => s.teamId === team.id);
  const me = board.students.find((s) => s.studentId === studentId)!;
  const teamRank = board.teams.findIndex((t) => t.id === team.id) + 1;
  return {
    student,
    team,
    squad,
    points: me.points,
    itemsSecured: me.items,
    bidsOnItems: me.bids,
    rankInTeam: inTeam.findIndex((s) => s.studentId === studentId) + 1,
    teamSize: inTeam.length,
    teamRank,
    teamCount: board.teams.length,
    items: db.items.filter((i) => i.studentId === studentId),
  };
}

// ── Bidders & bids ───────────────────────────────────────────────────────

export const bidderInput = z.object({
  displayName: z.string().trim().min(2, "Enter your name").max(40),
  town: z.string().trim().min(2, "Enter your town").max(40),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{10,20}$/, "Enter a mobile number"),
  smsOptIn: z.literal(true, { error: "Tick the box so we can text you if you're outbid" }),
  adult: z.literal(true, { error: "Bidders must be 18 or older" }),
});

/** Phase 1 stand-in for phone verification: the code step is mocked in the UI. */
export async function createBidder(input: z.input<typeof bidderInput>): Promise<Bidder> {
  const data = bidderInput.parse(input);
  return mutate((db) => {
    const digits = data.phone.replace(/\D/g, "");
    const existing = db.bidders.find((b) => b.phone.replace(/\D/g, "").endsWith(digits.slice(-10)));
    if (existing) return { ...existing };
    const b: Bidder = {
      id: newId("bdr"),
      createdAt: nowISO(),
      userId: null,
      displayName: data.displayName,
      town: data.town,
      phone: `+1${digits.slice(-10)}`,
      smsOptIn: true,
    };
    db.bidders.push(b);
    return b;
  });
}

export async function getBidder(id: string): Promise<Bidder | null> {
  return getDB().bidders.find((b) => b.id === id) ?? null;
}

export type BidWithBidder = Bid & { bidderName: string; bidderTown: string };

/** Bid history, newest first, with public display names (never phone numbers). */
export async function listBids(itemId: string): Promise<BidWithBidder[]> {
  const db = getDB();
  return db.bids
    .filter((b) => b.itemId === itemId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => {
      const who = db.bidders.find((x) => x.id === b.bidderId);
      return { ...b, bidderName: who?.displayName ?? "Bidder", bidderTown: who?.town ?? "" };
    });
}

/** The smallest bid that would be accepted right now. */
export function minimumNextBid(item: Item, auction: Auction) {
  return item.currentBidCents == null ? item.startingBidCents : item.currentBidCents + auction.minIncrementCents;
}

/** Quick-bid chip amounts: next minimum, then +$10 / +$25 style steps. */
export function quickBids(item: Item, auction: Auction): number[] {
  const min = minimumNextBid(item, auction);
  const inc = auction.minIncrementCents;
  return [min, min + inc, min + Math.round((inc * 2.5) / 500) * 500];
}

export type PlaceBidResult = { bid: Bid; item: Item; previousLeaderId: string | null };

/**
 * Mirrors the Phase 2 Postgres function place_bid(item_id, amount_cents):
 * checks the auction is live and before closesAt, the item is live, and the amount
 * is at least current bid + minimum increment; inserts the bid; updates the item;
 * returns the previous leader so they can be texted.
 */
export async function placeBid(itemId: string, bidderId: string, amountCents: number, at: Date = new Date()): Promise<PlaceBidResult> {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new DataError("invalid", "Enter a whole-dollar amount");
  return mutate((db) => {
    const item = must(db.items.find((i) => i.id === itemId), "Item");
    const auction = must(db.auctions.find((a) => a.id === item.auctionId), "Auction");
    if (!isAuctionOpen(auction, at)) throw new DataError("auction_closed", "Bidding has closed for this auction");
    if (item.status !== "live") throw new DataError("not_live", "This item isn't taking bids");
    const min = minimumNextBid(item, auction);
    if (amountCents < min) throw new DataError("bid_too_low", `Bid at least $${(min / 100).toFixed(0)}`);

    const previousLeaderId = item.leadingBidderId;
    const bid: Bid = { id: newId("bid"), createdAt: at.toISOString(), itemId, bidderId, amountCents };
    db.bids.push(bid);
    item.currentBidCents = amountCents;
    item.bidCount += 1;
    item.leadingBidderId = bidderId;

    if (previousLeaderId && previousLeaderId !== bidderId) {
      db.notifications.push({
        id: newId("ntf"),
        createdAt: at.toISOString(),
        kind: "outbid",
        to: previousLeaderId,
        payload: { itemId, amountCents, byBidderId: bidderId },
        status: "queued",
        sentAt: null,
      });
    }
    return { bid, item: { ...item }, previousLeaderId: previousLeaderId === bidderId ? null : previousLeaderId };
  });
}

/** Items where this bidder has bid, split into leading and outbid. */
export async function listBidderActivity(bidderId: string) {
  const db = getDB();
  const itemIds = new Set(db.bids.filter((b) => b.bidderId === bidderId).map((b) => b.itemId));
  const items = db.items.filter((i) => itemIds.has(i.id));
  return {
    leading: items.filter((i) => i.leadingBidderId === bidderId && i.status === "live"),
    outbid: items.filter((i) => i.leadingBidderId !== bidderId && i.status === "live"),
    wins: db.wins.filter((w) => w.bidderId === bidderId),
  };
}

/** This bidder's highest bid on an item (screen 10's "Your last bid"). */
export async function lastBidBy(itemId: string, bidderId: string): Promise<Bid | null> {
  const mine = getDB()
    .bids.filter((b) => b.itemId === itemId && b.bidderId === bidderId)
    .sort((a, b) => b.amountCents - a.amountCents);
  return mine[0] ?? null;
}

// ── Closing & wins ───────────────────────────────────────────────────────

/**
 * Close the auction: one win per item with bids. In Phase 2 this is the pg_cron job.
 * Exposed in Phase 1 so /demo can jump to the "You won" part of the story.
 */
export async function closeAuction(auctionId: string, at: Date = new Date()): Promise<Win[]> {
  return mutate((db) => {
    const a = must(db.auctions.find((x) => x.id === auctionId), "Auction");
    a.status = "closed";
    a.closesAt = at.toISOString();
    const created: Win[] = [];
    for (const it of db.items.filter((i) => i.auctionId === auctionId && i.status === "live")) {
      it.status = "closed";
      if (!it.leadingBidderId || it.currentBidCents == null) continue;
      if (db.wins.some((w) => w.itemId === it.id)) continue;
      const w: Win = {
        id: newId("win"),
        createdAt: at.toISOString(),
        itemId: it.id,
        bidderId: it.leadingBidderId,
        amountCents: it.currentBidCents,
        paymentStatus: "pending",
        everyorgChargeId: null,
        paidAt: null,
        passToken: newToken("pass"),
        expiresOn: new Date(at.getTime() + it.validDays * 86_400_000).toISOString().slice(0, 10),
        usesRemaining: it.uses,
      };
      db.wins.push(w);
      created.push(w);
    }
    return created;
  });
}

export async function getWinByPassToken(token: string): Promise<Win | null> {
  return getDB().wins.find((w) => w.passToken === token) ?? null;
}

/** Phase 1 stand-in for the Every.org webhook marking a win paid. */
export async function markWinPaid(winId: string, at: Date = new Date()): Promise<Win> {
  return mutate((db) => {
    const w = must(db.wins.find((x) => x.id === winId), "Win");
    if (w.paymentStatus === "paid") return { ...w };
    w.paymentStatus = "paid";
    w.paidAt = at.toISOString();
    w.everyorgChargeId = newId("mockcharge");
    const it = db.items.find((i) => i.id === w.itemId);
    if (it) it.status = "paid";
    return { ...w };
  });
}

/**
 * Business redeems a pass: must be one of their items, paid, unexpired, with uses left.
 */
export async function redeemPass(businessToken: string, passToken: string, at: Date = new Date()): Promise<{ win: Win; redemption: Redemption }> {
  return mutate((db) => {
    const biz = must(db.businesses.find((b) => b.dashboardToken === businessToken), "Business");
    const win = must(db.wins.find((w) => w.passToken === passToken), "Prize pass");
    const item = must(db.items.find((i) => i.id === win.itemId), "Item");
    if (item.businessId !== biz.id) throw new DataError("wrong_business", "This pass is for a different business");
    if (win.paymentStatus !== "paid") throw new DataError("pass_unpaid", "This pass hasn't been paid for yet");
    if (at.toISOString().slice(0, 10) > win.expiresOn) throw new DataError("pass_expired", "This pass has expired");
    if (win.usesRemaining <= 0) throw new DataError("pass_used", "This pass has already been fully redeemed");
    win.usesRemaining -= 1;
    if (win.usesRemaining === 0) item.status = "redeemed";
    const redemption: Redemption = { id: newId("rdm"), createdAt: at.toISOString(), winId: win.id, businessId: biz.id, redeemedAt: at.toISOString() };
    db.redemptions.push(redemption);
    return { win: { ...win }, redemption };
  });
}

// ── Posts ────────────────────────────────────────────────────────────────

export async function listPosts(filter: { itemId?: string; status?: Post["status"]; auctionId?: string } = {}): Promise<Post[]> {
  const db = getDB();
  const itemIds = filter.auctionId ? new Set(db.items.filter((i) => i.auctionId === filter.auctionId).map((i) => i.id)) : null;
  return db.posts
    .filter(
      (p) =>
        (!filter.itemId || p.itemId === filter.itemId) &&
        (!filter.status || p.status === filter.status) &&
        (!itemIds || itemIds.has(p.itemId)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function submitPost(input: { itemId: string; studentId: string; format: PostFormat; caption: string }): Promise<Post> {
  const caption = z.string().trim().min(10, "Write a caption").max(2200).parse(input.caption);
  return mutate((db) => {
    const p: Post = {
      id: newId("post"),
      createdAt: nowISO(),
      itemId: input.itemId,
      studentId: input.studentId,
      format: input.format,
      caption,
      status: "pending",
      reviewedBy: null,
      postedUrl: null,
      channel: null,
      postedOn: null,
      views: 0,
    };
    db.posts.push(p);
    return p;
  });
}

export async function reviewPost(
  postId: string,
  decision: { approve: boolean; reviewer: string; caption?: string },
): Promise<Post> {
  return mutate((db) => {
    const p = must(db.posts.find((x) => x.id === postId), "Post");
    if (decision.caption) p.caption = decision.caption;
    p.status = decision.approve ? "approved" : "rejected";
    p.reviewedBy = decision.reviewer;
    return { ...p };
  });
}

export async function markPostPosted(postId: string, postedUrl: string, channel: string): Promise<Post> {
  const url = z.url().parse(postedUrl);
  return mutate((db) => {
    const p = must(db.posts.find((x) => x.id === postId), "Post");
    p.status = "posted";
    p.postedUrl = url;
    p.channel = channel;
    p.postedOn = nowISO().slice(0, 10);
    return { ...p };
  });
}

// ── Views (business dashboard) ───────────────────────────────────────────

export async function listItemViews(itemId: string, days = 7): Promise<{ date: string; count: number }[]> {
  const rows: ItemView[] = getDB().itemViews.filter((v) => v.itemId === itemId);
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today.getTime() - d * 86_400_000).toISOString().slice(0, 10);
    out.push({ date, count: rows.filter((r) => r.viewedOn === date).reduce((n, r) => n + r.count, 0) });
  }
  return out;
}

export async function recordItemView(itemId: string, source: ItemView["source"]) {
  mutate((db) => {
    const date = nowISO().slice(0, 10);
    const row = db.itemViews.find((v) => v.itemId === itemId && v.source === source && v.viewedOn === date);
    if (row) row.count += 1;
    else db.itemViews.push({ id: newId("view"), createdAt: nowISO(), itemId, source, viewedOn: date, count: 1 });
  });
}

// ── Leaderboards ─────────────────────────────────────────────────────────

export type Leaderboard = {
  teams: TeamScore[];
  students: (StudentScore & { displayName: string; squadName: string | null })[];
};

export async function getLeaderboard(auctionId: string): Promise<Leaderboard> {
  const db = getDB();
  const students = db.students.filter((s) => s.auctionId === auctionId);
  const items = db.items.filter((i) => i.auctionId === auctionId);
  const scores = studentScores(students, items, db.bids);
  const teams = teamScores(
    db.teams.filter((t) => t.auctionId === auctionId),
    scores,
  );
  return {
    teams,
    students: scores.map((s) => {
      const st = students.find((x) => x.id === s.studentId)!;
      return {
        ...s,
        displayName: st.displayName,
        squadName: db.squads.find((q) => q.id === st.squadId)?.name ?? null,
      };
    }),
  };
}

export async function getTeamLeaderboard(teamId: string): Promise<{ team: Team; squads: SquadScore[]; students: Leaderboard["students"] } | null> {
  const db = getDB();
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) return null;
  const board = await getLeaderboard(team.auctionId);
  const scores = board.students.filter((s) => s.teamId === teamId);
  return { team, squads: squadScores(team, db.squads, scores), students: scores };
}

/** Business leaderboard: ranked by total raised (sum of current bids). */
export async function getBusinessLeaderboard(auctionId: string) {
  const db = getDB();
  return db.businesses
    .filter((b) => b.auctionId === auctionId)
    .map((b) => {
      const its = db.items.filter((i) => i.businessId === b.id && i.status !== "pending");
      return {
        business: b,
        items: its.length,
        bids: its.reduce((n, i) => n + i.bidCount, 0),
        raisedCents: its.reduce((n, i) => n + (i.currentBidCents ?? 0), 0),
      };
    })
    .sort((a, b) => b.raisedCents - a.raisedCents);
}

// ── Setup wizard ─────────────────────────────────────────────────────────

/** Creates a live auction with the four default grade teams and Faculty & Staff. */
export async function createAuction(input: {
  name: string;
  schoolName: string;
  opensAt: string;
  closesAt: string;
  nonprofit: { slug: string; name: string; ein: string };
  allowCustomSquads: boolean;
  socialHandle: string | null;
  approverName: string | null;
}): Promise<Auction> {
  return mutate((db) => {
    const base =
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "auction";
    let slug = base;
    for (let n = 2; db.auctions.some((a) => a.slug === slug); n++) slug = `${base}-${n}`;
    const id = newId("auc");
    const a: Auction = {
      id,
      createdAt: nowISO(),
      slug,
      name: input.name.trim(),
      schoolName: input.schoolName.trim(),
      opensAt: input.opensAt,
      closesAt: input.closesAt,
      status: "live",
      nonprofitSlug: input.nonprofit.slug,
      nonprofitName: input.nonprofit.name,
      nonprofitEin: input.nonprofit.ein,
      everyorgFundraiserId: null,
      allowCustomSquads: input.allowCustomSquads,
      minIncrementCents: 1000,
      socialHandle: input.socialHandle,
      approverName: input.approverName,
      reachFamilies: 0,
      reachFollowers: 0,
      organizerId: "usr-organizer",
    };
    db.auctions.push(a);
    defaultGradeTeams(new Date()).forEach((g) =>
      db.teams.push({ id: newId("team"), createdAt: nowISO(), auctionId: id, name: g.name, label: g.label, kind: "grade", classYear: g.classYear, sortOrder: g.sortOrder }),
    );
    db.teams.push({ id: newId("team"), createdAt: nowISO(), auctionId: id, name: "Faculty & Staff", label: "Faculty & Staff", kind: "faculty", classYear: null, sortOrder: 4 });
    return a;
  });
}

// ── Prize passes ─────────────────────────────────────────────────────────

/** Short code printed under the QR for manual entry when a camera won't scan. */
export function passCode(token: string) {
  return token.slice(-6).toUpperCase();
}

export type PassDetail = { win: Win; item: Item; business: Business; auction: Auction; bidderName: string };

export async function getPassDetail(token: string): Promise<PassDetail | null> {
  const db = getDB();
  const win = db.wins.find((w) => w.passToken === token);
  if (!win) return null;
  const item = db.items.find((i) => i.id === win.itemId)!;
  return {
    win: { ...win },
    item: { ...item },
    business: db.businesses.find((b) => b.id === item.businessId)!,
    auction: db.auctions.find((a) => a.id === item.auctionId)!,
    bidderName: db.bidders.find((b) => b.id === win.bidderId)?.displayName ?? "Winner",
  };
}

/** Accepts a scanned pass URL, a raw token, or the 6-character code. */
export async function lookupPass(input: string): Promise<PassDetail | null> {
  const text = input.trim();
  const fromUrl = text.match(/pass\/([A-Za-z0-9_]+)/)?.[1];
  const token = fromUrl ?? text;
  const db = getDB();
  const win =
    db.wins.find((w) => w.passToken === token) ??
    (token.length >= 4 && token.length <= 8 ? db.wins.find((w) => passCode(w.passToken) === token.toUpperCase()) : undefined);
  return win ? getPassDetail(win.passToken) : null;
}

/** Wins for one auction, with names, for the organizer. */
export async function listWins(auctionId: string) {
  const db = getDB();
  return db.wins
    .map((w) => ({ win: w, item: db.items.find((i) => i.id === w.itemId)! }))
    .filter((x) => x.item && x.item.auctionId === auctionId)
    .map((x) => ({ ...x, bidderName: db.bidders.find((b) => b.id === x.win.bidderId)?.displayName ?? "Winner" }));
}
