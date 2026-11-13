"use client";

import { useMemo, useState } from "react";
import { Check, Clock, MapPin, Share, SquarePlus } from "lucide-react";
import { BusinessLogo, ItemArt } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import { BottomSheet } from "@/components/app/BottomSheet";
import {
  Callout,
  GradientHeader,
  HeaderSubtitle,
  PageBody,
  PrimaryButton,
  QRCode,
  SecondaryButton,
} from "@/components/ui";
import { getPassDetail, markWinPaid, passCode } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { FEATURE_WALLET } from "@/lib/flags";
import { money } from "@/lib/format";
import { Screen, useRouteParams } from "./shared";

const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Screen 13 (paid) and the "You won, pay now" step before it (pending). */
export function PrizePass() {
  const { token } = useRouteParams<"token">();
  const pass = useData(() => getPassDetail(token), [token]);
  const toast = useToast();
  const [paying, setPaying] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);

  if (pass === undefined) return <ScreenSkeleton />;
  if (!pass) return <NotFound what="prize pass" />;

  const { win, item, business, auction, bidderName } = pass;
  const paid = win.paymentStatus === "paid";
  const used = win.usesRemaining <= 0;
  const passUrl = typeof window !== "undefined" ? `${window.location.origin}/pass/${win.passToken}` : `/pass/${win.passToken}`;

  if (!paid) {
    return (
      <Screen>
        <GradientHeader eyebrow={auction.name}>
          <h1 className="font-display text-[3.2rem] leading-none font-extrabold tracking-[-0.05em] italic">
            You <span className="text-lime-400">won!</span>
          </h1>
          <HeaderSubtitle className="max-w-none">
            {item.title} at {business.name} is yours for {money(win.amountCents)}. One last step.
          </HeaderSubtitle>
        </GradientHeader>
        <PageBody>
          <ItemArt art={item.artIcon} photo={item.photoPath} className="h-40">
            <BusinessLogo name={business.name} logo={business.logoPath} size="lg" className="absolute top-3 left-3" />
          </ItemArt>
          <ol className="space-y-3">
            {[
              `Pay ${money(win.amountCents)} to the ${auction.nonprofitName} on Every.org.`,
              "We confirm your payment, usually within a minute.",
              `Your prize pass appears here. Show it at ${business.name}.`,
            ].map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 font-display font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-navy-900">{t}</span>
              </li>
            ))}
          </ol>
          <PrimaryButton onClick={() => setPaying(true)}>Pay {money(win.amountCents)} on Every.org</PrimaryButton>
          <Callout tone="info" icon={<Clock />}>
            Paid already? We&apos;re waiting for Every.org to confirm. This page updates on its own.
          </Callout>
          <p className="text-center text-sm text-ink-500">
            Outbid never touches the money. Your payment goes straight to the charity.
          </p>
        </PageBody>

        {/* Phase 1 stand-in for Every.org checkout + webhook. */}
        <BottomSheet open={paying} onClose={() => setPaying(false)} title="Every.org (demo)">
          <div className="space-y-4">
            <p className="text-ink-500">
              In the real app this opens Every.org to donate <strong className="text-navy-900">{money(win.amountCents)}</strong> to
              the {auction.nonprofitName}. Their confirmation unlocks your pass.
            </p>
            <PrimaryButton
              onClick={async () => {
                await markWinPaid(win.id);
                setPaying(false);
                toast("Payment confirmed. Here's your pass!");
                window.scrollTo({ top: 0 });
              }}
            >
              Complete demo payment
            </PrimaryButton>
          </div>
        </BottomSheet>
      </Screen>
    );
  }

  return (
    <Screen className="overflow-hidden">
      <Confetti />
      <GradientHeader eyebrow={auction.name}>
        <h1 className="text-center font-display text-[3.6rem] leading-none font-extrabold tracking-[-0.05em] italic">
          You <span className="text-lime-400">won!</span>
        </h1>
        <p className="mx-auto max-w-[32ch] text-center text-lg leading-snug">
          {item.title} at <strong className="text-lime-400">{business.name}</strong> is yours! Winning bid{" "}
          {money(win.amountCents)}. Every dollar goes to the {auction.nonprofitName}.
        </p>
      </GradientHeader>
      <PageBody className="relative space-y-4">
        <div className="space-y-4 rounded-[24px] bg-navy-900 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-3xl leading-tight font-extrabold tracking-[-0.03em] uppercase">{business.name}</p>
            <span className="shrink-0 rounded-full bg-lime-50 px-3 py-1.5 font-display text-sm font-extrabold text-green-700">
              PRIZE PASS
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PassFact label="Prize" value={item.title} />
            <PassFact label="Uses" value={used ? "All used" : `${win.usesRemaining} of ${item.uses}`} />
            <PassFact label="Winner" value={bidderName} />
            <PassFact label="Expires" value={fmtDate(win.expiresOn)} />
          </dl>
          <div className="flex gap-3 rounded-2xl bg-white p-2 text-navy-900">
            <ItemArt art={item.artIcon} photo={item.photoPath} className="h-24 w-[45%] shrink-0 rounded-xl">
              <BusinessLogo name={business.name} logo={business.logoPath} size="sm" className="absolute top-2 left-2" />
            </ItemArt>
            <div className="min-w-0 py-1">
              <p className="flex items-start gap-1.5 font-display font-extrabold">
                <MapPin className="size-4 shrink-0 text-green-500" aria-hidden="true" />
                <span className="leading-tight">{business.name}</span>
              </p>
              <p className="mt-1 text-sm leading-snug text-ink-500">{business.address ?? "Address on your text"}</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center rounded-2xl bg-white px-4 py-5">
            <QRCode value={passUrl} size={190} label="Prize pass QR code" className={used ? "opacity-20" : undefined} />
            <p className="mt-2 font-mono text-sm tracking-[0.3em] text-navy-900">{passCode(win.passToken)}</p>
            {used ? (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-xl border-4 border-green-500 px-4 py-1 font-display text-2xl font-extrabold text-green-700 uppercase">
                Redeemed
              </span>
            ) : null}
          </div>
          <p className="text-center text-sm">Show this at the counter. They scan, you enjoy.</p>
        </div>

        {FEATURE_WALLET ? (
          <>
            <SecondaryButton variant="navy">Add to Apple Wallet</SecondaryButton>
            <SecondaryButton>Add to Google Wallet</SecondaryButton>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton variant="navy" icon={<SquarePlus />} onClick={() => setInstallHelp(true)}>
              Save pass
            </SecondaryButton>
            <SecondaryButton
              icon={<Share />}
              onClick={async () => {
                try {
                  if (navigator.share) await navigator.share({ title: "My Outbid prize pass", url: passUrl });
                  else {
                    await navigator.clipboard.writeText(passUrl);
                    toast("Pass link copied");
                  }
                } catch {
                  /* cancelled */
                }
              }}
            >
              Share pass
            </SecondaryButton>
          </div>
        )}

        <Callout icon={<Check />}>
          Paid {money(win.amountCents)} to the {auction.nonprofitName} on Every.org.
          <span className="block text-sm">Receipt sent to your email.</span>
        </Callout>
      </PageBody>

      <BottomSheet open={installHelp} onClose={() => setInstallHelp(false)} title="Keep it handy">
        <div className="space-y-3 text-navy-900">
          <p>Add this pass to your home screen so it opens in one tap, even at the counter.</p>
          <p>
            <strong>iPhone:</strong> tap <Share className="inline size-4" aria-label="Share" /> in Safari, then
            &ldquo;Add to Home Screen&rdquo;.
          </p>
          <p>
            <strong>Android:</strong> tap the ⋮ menu in Chrome, then &ldquo;Add to Home screen&rdquo;.
          </p>
          <PrimaryButton onClick={() => setInstallHelp(false)} arrow={false}>
            Got it
          </PrimaryButton>
        </div>
      </BottomSheet>
    </Screen>
  );
}

function PassFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-extrabold tracking-[0.16em] text-white/60 uppercase">{label}</dt>
      <dd className="font-display text-lg leading-tight font-bold">{value}</dd>
    </div>
  );
}

/** Falling confetti in brand colours. Purely decorative. */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 97) % 100,
        delay: (i % 12) * 0.18,
        dur: 2.6 + ((i * 7) % 10) / 6,
        color: ["#84E81C", "#0767B3", "#FFC93C", "#1BAA85", "#FFFFFF"][i % 5],
        drift: ((i * 37) % 80) - 40,
        w: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto h-dvh max-w-[480px] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-[2px]"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.w * 1.8,
              background: p.color,
              animation: `confetti-fall ${p.dur}s ${p.delay}s cubic-bezier(.25,.6,.4,1) both`,
              "--drift": `${p.drift}px`,
              "--spin": `${360 + (i % 4) * 180}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
