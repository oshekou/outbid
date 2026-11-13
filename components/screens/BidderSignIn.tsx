"use client";

import { useState } from "react";
import { MapPin, Phone, User } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { PrimaryButton, TextField } from "@/components/ui";
import { createBidder, bidderInput } from "@/lib/data";
import { setViewer } from "@/lib/session";
import type { Bidder } from "@/lib/types";

/**
 * Shown the first time someone taps Bid: name, town, phone, then a text code.
 * Phase 1 accepts any 6-digit code; Phase 4 sends a real one through Twilio Verify.
 */
export function BidderSignIn({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn: (bidder: Bidder) => void;
}) {
  const [step, setStep] = useState<"details" | "code">("details");
  const [form, setForm] = useState({ displayName: "", town: "", phone: "", smsOptIn: false, adult: false });
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function next() {
    const r = bidderInput.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setStep("code");
  }

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: "Enter the 6-digit code" });
      return;
    }
    const bidder = await createBidder(form as Parameters<typeof createBidder>[0]);
    setViewer({ role: "bidder", bidderId: bidder.id });
    setStep("details");
    setCode("");
    onSignedIn(bidder);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={step === "details" ? "Before you bid" : "Check your texts"}>
      {step === "details" ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <p className="text-ink-500">We text you if you&apos;re outbid. Your phone number is never shown to anyone.</p>
          <TextField
            label="Your name"
            icon={<User />}
            placeholder="Jamie T."
            autoComplete="name"
            value={form.displayName}
            error={errors.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Town"
              icon={<MapPin />}
              placeholder="Ross"
              autoComplete="address-level2"
              value={form.town}
              error={errors.town}
              onChange={(e) => setForm({ ...form, town: e.target.value })}
            />
            <TextField
              label="Mobile"
              icon={<Phone />}
              placeholder="(415) 555…"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              error={errors.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Check
            checked={form.smsOptIn}
            onChange={(v) => setForm({ ...form, smsOptIn: v })}
            error={errors.smsOptIn}
            label="Text me if I'm outbid or win. Reply STOP any time."
          />
          <Check
            checked={form.adult}
            onChange={(v) => setForm({ ...form, adult: v })}
            error={errors.adult}
            label="I'm 18 or older. A bid is a promise to pay if I win."
          />
          <PrimaryButton type="submit">Text me a code</PrimaryButton>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <p className="text-ink-500">
            We sent a 6-digit code to <strong className="text-navy-900">{form.phone}</strong>.{" "}
            <span className="text-sm">(Demo: any 6 digits work.)</span>
          </p>
          <TextField
            label="Code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            error={errors.code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-[0.5em]"
          />
          <PrimaryButton type="submit">Verify and bid</PrimaryButton>
          <button type="button" onClick={() => setStep("details")} className="w-full py-2 text-sm font-bold text-blue-600">
            Change number
          </button>
        </form>
      )}
    </BottomSheet>
  );
}

function Check({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-navy-900">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[#0E8479]"
        />
        {label}
      </label>
      {error ? <p className="mt-1 ml-8 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
