"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Gavel, GraduationCap, RotateCcw, School, Store } from "lucide-react";
import { useToast } from "@/components/app/Toast";
import { GradientHeader, Headline, HeaderSubtitle, PageBody, SectionLabel } from "@/components/ui";
import { cn } from "@/lib/cn";
import { closeAuction, getAuction, getItem, isAuctionOpen, minimumNextBid, placeBid, resetDB } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { DEMO } from "@/lib/mock/seed";
import { clearViewer, setViewer, useViewer, type Role } from "@/lib/session";
import { Screen } from "./shared";

const A = DEMO.auctionSlug;

const ROLES: { role: Role; label: string; who: string; icon: typeof School; href: string; patch: Parameters<typeof setViewer>[0] }[] = [
  { role: "organizer", label: "Organizer", who: "Ms. Okafor", icon: School, href: `/admin/${A}`, patch: { role: "organizer" } },
  { role: "student", label: "Student", who: "Olivia S., Class of 2027", icon: GraduationCap, href: `/a/${A}/me`, patch: { role: "student", studentId: DEMO.studentId } },
  { role: "business", label: "Business", who: "Redwood Slice Co.", icon: Store, href: `/b/${DEMO.businessToken}`, patch: { role: "business", businessToken: DEMO.businessToken } },
  { role: "bidder", label: "Bidder", who: "Jamie T., Ross", icon: Gavel, href: `/a/${A}`, patch: { role: "bidder", bidderId: DEMO.bidderId } },
];

/** Story hub: pick who you are, then jump to any step of the demo. */
export function Demo() {
  const router = useRouter();
  const toast = useToast();
  const viewer = useViewer();
  const auction = useData(() => getAuction(A), []);
  const open = auction ? isAuctionOpen(auction) : true;

  function go(patch: Parameters<typeof setViewer>[0], href: string) {
    setViewer(patch);
    router.push(href);
  }

  async function rivalBid() {
    const item = await getItem(DEMO.bidItemId);
    const a = await getAuction(A);
    if (!item || !a || !isAuctionOpen(a)) return toast("Bidding is closed. Reset the demo first.", "error");
    setViewer({ role: "bidder", bidderId: DEMO.bidderId });
    // Make sure Jamie has a bid in, then someone else tops it.
    if (item.leadingBidderId !== DEMO.bidderId) await placeBid(item.id, DEMO.bidderId, minimumNextBid(item, a));
    const fresh = (await getItem(item.id))!;
    await placeBid(item.id, DEMO.rivalBidderId, minimumNextBid(fresh, a));
    toast("Coach Daniels just outbid Jamie. Text sent!");
    router.push(`/a/${A}/items/${item.id}/outbid`);
  }

  async function close() {
    const a = await getAuction(A);
    if (!a) return;
    if (isAuctionOpen(a)) {
      // Make sure Jamie wins the dinner so there's a prize to pay for.
      const item = await getItem(DEMO.bidItemId);
      if (item && item.leadingBidderId !== DEMO.bidderId) await placeBid(item.id, DEMO.bidderId, minimumNextBid(item, a));
      await closeAuction(a.id);
    }
    setViewer({ role: "bidder", bidderId: DEMO.bidderId });
    router.push(`/a/${A}/me`);
    toast("Bidding closed. Check Jamie's prizes.");
  }

  const story: { n: number; who: string; title: string; href?: string; action?: () => void }[] = [
    { n: 1, who: "Organizer", title: "Set up an auction", href: "/setup" },
    { n: 2, who: "Student", title: "Join and pick a grade", href: `/a/${A}/join` },
    { n: 3, who: "Student", title: "Show the ask card", action: () => go(ROLES[1]!.patch, `/a/${A}/ask`) },
    { n: 4, who: "Business", title: "Scan the QR and see the pitch", href: `/give/${A}/${DEMO.studentSlug}` },
    { n: 5, who: "Business", title: "Donate an item", href: `/give/${A}/${DEMO.studentSlug}/item` },
    { n: 6, who: "Student", title: "Make a post", action: () => go(ROLES[1]!.patch, `/a/${A}/items/${DEMO.postItemId}/post`) },
    { n: 7, who: "Organizer", title: "Approve posts and items", action: () => go(ROLES[0]!.patch, `/admin/${A}`) },
    { n: 8, who: "Business", title: "Watch the impact dashboard", action: () => go(ROLES[2]!.patch, `/b/${DEMO.businessToken}`) },
    { n: 9, who: "Bidder", title: "Bid on an item", action: () => go(ROLES[3]!.patch, `/a/${A}/items/${DEMO.bidItemId}`) },
    { n: 10, who: "Bidder", title: "Get outbid (simulate a rival)", action: rivalBid },
    { n: 11, who: "Everyone", title: "Check the leaderboard", href: `/a/${A}/leaderboard` },
    { n: 12, who: "Bidder", title: "Close bidding and pay", action: close },
    { n: 13, who: "Bidder", title: "Open a prize pass", href: `/pass/${DEMO.passToken}` },
    { n: 14, who: "Business", title: "Scan and redeem it", action: () => go({ role: "business", businessToken: DEMO.redeemBusinessToken }, `/b/${DEMO.redeemBusinessToken}/redeem`) },
  ];

  return (
    <Screen>
      <GradientHeader eyebrow="Branson Fall Auction" watermark back="/">
        <Headline highlight="demo.">Take the</Headline>
        <HeaderSubtitle>Pick who you are, or follow the story from setup to a redeemed prize. Everything here is made-up data.</HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        <section>
          <SectionLabel>View as</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const on = viewer.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => go(r.patch, r.href)}
                  className={cn(
                    "rounded-card border-[1.5px] p-4 text-left transition active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                    on ? "border-lime-400 bg-lime-50" : "border-border bg-card hover:border-teal-500",
                  )}
                >
                  <r.icon className="size-7 text-teal-500" aria-hidden="true" />
                  <p className="mt-2 font-display text-lg font-extrabold text-navy-900">{r.label}</p>
                  <p className="text-sm leading-snug text-ink-500">{r.who}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionLabel aside={open ? "Auction is live" : "Bidding closed"}>The story</SectionLabel>
          <ol className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
            {story.map((s) => {
              const body = (
                <>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-sm font-extrabold text-white">
                    {s.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold tracking-wider text-teal-500 uppercase">{s.who}</span>
                    <span className="block font-display font-bold text-navy-900">{s.title}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-500" aria-hidden="true" />
                </>
              );
              const cls = "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-600";
              return (
                <li key={s.n}>
                  {s.href ? (
                    <Link href={s.href} className={cls}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={s.action} className={cls}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <button
          type="button"
          onClick={() => {
            resetDB();
            clearViewer();
            try {
              sessionStorage.removeItem("outbid:setup-draft");
            } catch {
              /* ignore */
            }
            toast("Demo reset");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-display font-bold text-ink-500 hover:text-navy-900"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Reset the demo
        </button>
      </PageBody>
    </Screen>
  );
}
