"use client";

import { scrollAppToTop } from "@/components/app/DeviceFrame";
import { useRef, useState } from "react";
import { Camera, CircleCheck, Star } from "lucide-react";
import { NotFound, ScreenSkeleton } from "@/components/app/States";
import { useToast } from "@/components/app/Toast";
import {
  Callout,
  Card,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  PageBody,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextField,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { donateInput, donateItem, getStudent, getTeam } from "@/lib/data";
import { useData } from "@/lib/data/hooks";
import { setViewer } from "@/lib/session";
import type { Business } from "@/lib/types";
import { Screen, useAuction, useRouteParams } from "./shared";

const MAX_BYTES = 5 * 1024 * 1024;

/** Shrink a photo on the device before it's stored (Phase 2 uploads the result). */
async function resizeImage(file: File, max = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Screen 06: the business fills in the item. Credit goes to the student who asked. */
export function DonateItem() {
  const { auction: slug, student: studentSlug } = useRouteParams<"auction" | "student">();
  const auction = useAuction(slug);
  const student = useData(async () => (auction ? getStudent(auction.id, studentSlug) : null), [auction?.id, studentSlug]);
  const team = useData(async () => (student ? getTeam(student.teamId) : null), [student?.teamId]);
  const toast = useToast();

  const [form, setForm] = useState({ businessName: "", title: "", retail: "", uses: "1", validDays: "90", description: "", phone: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Business | null>(null);
  const [busy, setBusy] = useState(false);

  if (auction === undefined || student === undefined || team === undefined) return <ScreenSkeleton />;
  if (!auction || !student) return <NotFound what="donation link" />;

  const first = student.displayName.split(" ")[0];
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit() {
    const input = {
      businessName: form.businessName,
      title: form.title,
      retailValueCents: Math.round(Number(form.retail.replace(/[^\d.]/g, "")) * 100),
      uses: Number(form.uses) || 0,
      validDays: Number(form.validDays.replace(/\D/g, "")) || 0,
      description: form.description,
      phone: form.phone,
      photoPath: photo,
      logoPath: logo,
    };
    const r = donateInput.safeParse(input);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      toast("Check the highlighted fields", "error");
      return;
    }
    setErrors({});
    setBusy(true);
    const { business } = await donateItem(auction!.id, student!.id, input);
    setViewer({ businessToken: business.dashboardToken });
    setBusy(false);
    setDone(business);
    scrollAppToTop();
  }

  if (done) {
    return (
      <Screen>
        <GradientHeader eyebrow={auction.name}>
          <Headline highlight="you!">Thank</Headline>
          <HeaderSubtitle>Your gift is in. {first} just earned points for {team?.name}.</HeaderSubtitle>
        </GradientHeader>
        <PageBody>
          <Card className="flex flex-col items-center px-6 py-8 text-center">
            <CircleCheck className="size-16 text-green-500" aria-hidden="true" />
            <p className="mt-3 font-display text-xl font-extrabold text-navy-900">{form.title}</p>
            <p className="mt-1 text-ink-500">
              The organizer will approve it shortly, then students start posting. We texted your dashboard link to{" "}
              <strong className="text-navy-900">{form.phone}</strong>.
            </p>
          </Card>
          <PrimaryButton href={`/b/${done.dashboardToken}`} variant="gradient">
            Open my dashboard
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              setDone(null);
              setForm({ ...form, title: "", retail: "", description: "" });
              setPhoto(null);
            }}
          >
            Donate another item
          </SecondaryButton>
        </PageBody>
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader eyebrow={auction.name} back={`/give/${slug}/${studentSlug}`}>
        <Headline highlight="item">Donate an</Headline>
        <HeaderSubtitle>Two minutes. Your gift gets a whole-school spotlight.</HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-center gap-3">
            <ImagePicker label="Photo" icon={<Camera />} value={photo} onChange={setPhoto} onError={(m) => toast(m, "error")} />
            <ImagePicker label="Logo" icon={<Star />} value={logo} onChange={setLogo} onError={(m) => toast(m, "error")} tone="teal" />
            <p className="min-w-0 flex-1 text-sm text-ink-500">Your logo goes on every post about this item.</p>
          </div>
          <TextField label="Business name" placeholder="Marin Slice Co." autoComplete="organization" value={form.businessName} onChange={set("businessName")} error={errors.businessName} />
          <TextField label="What are you donating?" placeholder="Pizza party for 10" value={form.title} onChange={set("title")} error={errors.title} />
          <div className="grid grid-cols-3 gap-2.5">
            <TextField label="Retail value" placeholder="$150" inputMode="decimal" value={form.retail} onChange={set("retail")} error={errors.retailValueCents} />
            <TextField label="Uses" inputMode="numeric" value={form.uses} onChange={set("uses")} error={errors.uses} />
            <TextField label="Valid for" inputMode="numeric" value={form.validDays} onChange={set("validDays")} error={errors.validDays} aside="days" />
          </div>
          <TextArea label="One line for the post" placeholder="Two large pies, salad, drinks, and the back room is yours for two hours." value={form.description} onChange={set("description")} error={errors.description} maxLength={160} />
          <TextField label="Your phone (for the dashboard link)" type="tel" inputMode="tel" autoComplete="tel" placeholder="(415) 555 0142" value={form.phone} onChange={set("phone")} error={errors.phone} />
          <Callout icon={<Star />} iconTile>
            Credit goes to{" "}
            <strong className="text-navy-900">
              {student.displayName}, {team?.name}.
            </strong>{" "}
            {first} asked you, {first} gets the points.
          </Callout>
          <PrimaryButton type="submit" disabled={busy}>
            Donate It
          </PrimaryButton>
        </form>
      </PageBody>
    </Screen>
  );
}

function ImagePicker({
  label,
  icon,
  value,
  onChange,
  onError,
  tone = "blue",
}: {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onChange: (v: string | null) => void;
  onError: (m: string) => void;
  tone?: "blue" | "teal";
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          "relative grid size-[5.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card font-display font-bold transition hover:border-teal-500",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          tone === "blue" ? "text-blue-600" : "text-teal-500",
        )}
        aria-label={value ? `Change ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 [&>svg]:size-7">
            {icon}
            {label}
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (!f.type.startsWith("image/")) return onError("Choose an image file");
          if (f.size > MAX_BYTES) return onError("Images must be under 5 MB");
          try {
            onChange(await resizeImage(f));
          } catch {
            onError("Couldn't read that image");
          }
        }}
      />
    </>
  );
}
