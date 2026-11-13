"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, CircleCheck, CircleX, ScanLine, Store, Tag, Ticket, User } from "lucide-react";
import { BusinessLogo, ItemArt } from "@/components/app/ItemArt";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Card,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  PageBody,
  PrimaryButton,
  SecondaryButton,
  TextField,
} from "@/components/ui";
import { DataError, getBusinessByToken, lookupPass, redeemPass, type PassDetail } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { money } from "@/lib/format";
import { Screen, useRouteParams } from "./shared";

type BarcodeDetectorLike = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

/** Screen 14: the business scans the winner's pass (or types its code) and redeems it. */
export function Redeem() {
  const { token } = useRouteParams<"token">();
  const business = useData(() => getBusinessByToken(token), [token]);
  const toast = useToast();
  const [found, setFound] = useState<PassDetail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  if (business === undefined) return <ScreenSkeleton />;
  if (!business) return <NotFound what="business" />;

  async function check(input: string) {
    setRedeemed(false);
    const p = await lookupPass(input);
    if (!p) {
      setFound(null);
      setProblem("We couldn't find a prize pass with that code.");
      return;
    }
    if (p.business.id !== business!.id) {
      setFound(null);
      setProblem(`That pass is for ${p.business.name}, not ${business!.name}.`);
      return;
    }
    setProblem(null);
    setFound(p);
  }

  async function redeem() {
    if (!found) return;
    try {
      const r = await redeemPass(token, found.win.passToken);
      setFound({ ...found, win: r.win });
      setRedeemed(true);
      toast("Redeemed. Enjoy!");
    } catch (e) {
      toast(e instanceof DataError ? e.message : "Couldn't redeem. Try again.", "error");
    }
  }

  const expired = found ? new Date().toISOString().slice(0, 10) > found.win.expiresOn : false;
  const blocked = found
    ? found.win.paymentStatus !== "paid"
      ? "Not paid yet. Ask the winner to finish paying on Every.org."
      : expired
        ? "This pass has expired."
        : found.win.usesRemaining <= 0
          ? "Already fully redeemed."
          : null
    : null;

  return (
    <Screen>
      <GradientHeader
        back={`/b/${token}`}
        right={
          <span className="inline-flex items-center gap-2 rounded-full bg-lime-50 px-4 py-2 text-sm font-bold text-navy-900">
            <Store className="size-4" aria-hidden="true" /> {business.name}
          </span>
        }
      >
        <Headline highlight="Redeem">Scan &amp;</Headline>
        <HeaderSubtitle>Scan the winner&apos;s QR code to view their auction item and mark it as redeemed.</HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        {scanning ? (
          <Scanner
            onResult={(text) => {
              setScanning(false);
              check(text);
            }}
            onCancel={(why) => {
              setScanning(false);
              if (why) toast(why, "error");
            }}
          />
        ) : !found ? (
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="flex w-full items-center gap-5 rounded-card border border-border bg-card px-5 py-5 text-left transition hover:border-teal-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="relative grid size-20 shrink-0 place-items-center">
              <span className="absolute inset-0 rounded-xl border-[3px] border-green-500 [clip-path:polygon(0_0,30%_0,30%_100%,70%_100%,70%_0,100%_0,100%_30%,0_30%,0_70%,100%_70%,100%_100%,0_100%)]" />
              <ScanLine className="size-9 text-navy-900" aria-hidden="true" />
            </span>
            <span className="border-l border-border pl-5">
              <span className="block font-display text-xl font-extrabold text-navy-900">Scan a QR Code</span>
              <span className="mt-1 block text-ink-500">Use your camera to scan the winner&apos;s prize pass.</span>
            </span>
          </button>
        ) : null}

        {!found ? (
          <form
            className="flex items-end gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) check(code);
            }}
          >
            <TextField
              className="min-w-0 flex-1"
              label="Or type the code"
              placeholder="6 letters under the QR"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              maxLength={80}
            />
            <SecondaryButton type="submit" variant="navy" className="w-auto shrink-0 px-6">
              Find
            </SecondaryButton>
          </form>
        ) : null}

        {problem ? (
          <div role="alert" className="flex items-start gap-3 rounded-card bg-red-50 px-4 py-3 text-red-800">
            <CircleX className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {problem}
          </div>
        ) : null}

        {found ? (
          <Card className="animate-fade-in space-y-4 p-4 shadow-sm">
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${blocked && !redeemed ? "bg-red-50 text-red-800" : "bg-lime-50 text-navy-900"}`}>
              {blocked && !redeemed ? (
                <CircleX className="size-7 shrink-0" aria-hidden="true" />
              ) : (
                <CircleCheck className="size-7 shrink-0 fill-green-500 text-white" aria-hidden="true" />
              )}
              <span className="font-display text-lg font-extrabold">
                {redeemed ? "Redeemed!" : blocked ?? "Auction Item Found"}
              </span>
            </div>
            <ItemArt art={found.item.artIcon} photo={found.item.photoPath} className="h-36">
              <BusinessLogo name={found.business.name} logo={found.business.logoPath} size="lg" className="absolute top-3 left-3" />
            </ItemArt>
            <h2 className="font-display text-2xl leading-tight font-extrabold tracking-[-0.03em] text-navy-900">
              {found.item.title} at {found.business.name}
            </h2>
            <dl className="divide-y divide-border">
              <Fact icon={<User />} label="Winner" value={found.bidderName} />
              <Fact icon={<Tag />} label="Winning bid" value={money(found.win.amountCents)} />
              <Fact icon={<CalendarDays />} label="Expires" value={new Date(`${found.win.expiresOn}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
              <Fact icon={<Ticket />} label="Uses left" value={`${found.win.usesRemaining} of ${found.item.uses}`} />
            </dl>
            {!blocked && !redeemed ? (
              <PrimaryButton onClick={redeem} trailingIcon={<Check />}>
                Redeem Item
              </PrimaryButton>
            ) : null}
            <SecondaryButton
              icon={<ScanLine />}
              onClick={() => {
                setFound(null);
                setCode("");
                setRedeemed(false);
                setScanning(true);
              }}
            >
              Scan Another QR Code
            </SecondaryButton>
          </Card>
        ) : null}
      </PageBody>
    </Screen>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-navy-800 [&>svg]:size-5" aria-hidden="true">
        {icon}
      </span>
      <dt className="flex-1 text-ink-500">{label}</dt>
      <dd className="font-display font-extrabold text-navy-900">{value}</dd>
    </div>
  );
}

/** Live camera preview that reads QR codes with the browser's BarcodeDetector. */
function Scanner({ onResult, onCancel }: { onResult: (text: string) => void; onCancel: (why?: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  // Keep the latest callbacks without restarting the camera on every render.
  const cb = useRef({ onResult, onCancel });
  useEffect(() => {
    cb.current = { onResult, onCancel };
  });
  useEffect(() => {
    const onResult = (t: string) => cb.current.onResult(t);
    const onCancel = (why?: string) => cb.current.onCancel(why);
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      onCancel("This browser can't scan. Type the code under the QR instead.");
      return;
    }
    const detector = new Detector({ formats: ["qr_code"] });
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
        timer = setInterval(async () => {
          if (!video.current || video.current.readyState < 2) return;
          try {
            const codes = await detector.detect(video.current);
            if (codes[0]?.rawValue) onResult(codes[0].rawValue);
          } catch {
            /* keep trying */
          }
        }, 300);
      })
      .catch(() => onCancel("Camera blocked. Type the code under the QR instead."));
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-card bg-navy-900">
        <video ref={video} className="size-full object-cover" playsInline muted />
        <div className="pointer-events-none absolute inset-10 rounded-3xl border-4 border-lime-400/90" aria-hidden="true" />
        <p className="absolute inset-x-0 bottom-3 text-center text-sm font-bold text-white">Point at the prize pass QR</p>
      </div>
      <SecondaryButton onClick={() => onCancel()}>Cancel</SecondaryButton>
    </div>
  );
}
