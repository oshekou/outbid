import { beforeEach, describe, expect, it } from "vitest";
import {
  closeAuction,
  DataError,
  getItem,
  joinAuction,
  listBids,
  placeBid,
  quickBids,
  getAuction,
  redeemPass,
  resetDB,
} from "@/lib/data";
import { DEMO } from "@/lib/mock/seed";

beforeEach(() => resetDB());

describe("placeBid", () => {
  it("accepts current + increment and returns the previous leader", async () => {
    const r = await placeBid(DEMO.bidItemId, DEMO.rivalBidderId, 15000);
    expect(r.previousLeaderId).toBe(DEMO.bidderId);
    expect(r.item.currentBidCents).toBe(15000);
    expect(r.item.bidCount).toBe(10);
    expect((await listBids(DEMO.bidItemId))[0]!.bidderName).toBe("Coach Daniels");
  });

  it("rejects a bid below current + increment", async () => {
    await expect(placeBid(DEMO.bidItemId, DEMO.rivalBidderId, 14500)).rejects.toMatchObject({ code: "bid_too_low" });
  });

  it("rejects a tie", async () => {
    await expect(placeBid(DEMO.bidItemId, DEMO.rivalBidderId, 14000)).rejects.toBeInstanceOf(DataError);
  });

  it("rejects bids after close", async () => {
    const a = (await getAuction("branson"))!;
    const after = new Date(new Date(a.closesAt).getTime() + 1000);
    await expect(placeBid(DEMO.bidItemId, DEMO.rivalBidderId, 20000, after)).rejects.toMatchObject({ code: "auction_closed" });
  });

  it("only one of two equal back-to-back bids wins", async () => {
    const results = await Promise.allSettled([
      placeBid(DEMO.bidItemId, "bdr-evan", 15000),
      placeBid(DEMO.bidItemId, "bdr-rosa", 15000),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });

  it("quick bids start at the minimum", async () => {
    const item = (await getItem(DEMO.bidItemId))!;
    const a = (await getAuction("branson"))!;
    expect(quickBids(item, a)).toEqual([15000, 16000, 17500]);
  });
});

describe("closing and redeeming", () => {
  it("creates pending wins for items with bids", async () => {
    const a = (await getAuction("branson"))!;
    const wins = await closeAuction(a.id);
    expect(wins.length).toBe(6); // six live items with bids; pending item and existing win excluded
    expect(wins.every((w) => w.paymentStatus === "pending")).toBe(true);
  });

  it("redeems a paid pass exactly `uses` times", async () => {
    await redeemPass(DEMO.redeemBusinessToken, DEMO.passToken);
    await expect(redeemPass(DEMO.redeemBusinessToken, DEMO.passToken)).rejects.toMatchObject({ code: "pass_used" });
  });

  it("refuses a pass from another business", async () => {
    await expect(redeemPass(DEMO.businessToken, DEMO.passToken)).rejects.toMatchObject({ code: "wrong_business" });
  });
});

describe("joinAuction", () => {
  it("normalises the name and makes a unique slug", async () => {
    const s = await joinAuction("auc-branson", { displayName: "olivia k", teamId: "team-juniors", squadId: null });
    expect(s.displayName).toBe("Olivia K.");
    expect(s.slug).toBe("olivia2");
  });

  it("rejects full last names", async () => {
    await expect(joinAuction("auc-branson", { displayName: "Olivia Smith", teamId: "team-juniors", squadId: null })).rejects.toThrow();
  });
});
