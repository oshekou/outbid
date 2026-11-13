"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  Footprints,
  Gift,
  Hand,
  Heart,
  School,
  Search,
  ShieldCheck,
  Tag,
  Trophy,
  User,
  UsersRound,
} from "lucide-react";
import { useToast } from "@/components/app/Toast";
import {
  Callout,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  ListCard,
  ListRow,
  PageBody,
  PrimaryButton,
  ProgressSteps,
  SectionLabel,
  TextField,
  Toggle,
  type TileTone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { createAuction, searchNonprofits } from "@/lib/data";
import { defaultGradeTeams } from "@/lib/school-year";
import { setViewer } from "@/lib/session";
import type { Nonprofit } from "@/lib/types";
import { Screen } from "./shared";

// ── Draft kept in sessionStorage across the three steps ──────────────────

type Draft = {
  name: string;
  schoolName: string;
  opens: string; // yyyy-mm-dd
  closes: string; // yyyy-mm-ddThh:mm
  nonprofit: Nonprofit | null;
  allowCustomSquads: boolean;
  socialHandle: string;
  approverName: string;
};

const KEY = "outbid:setup-draft";
const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function freshDraft(): Draft {
  const now = new Date();
  const close = new Date(now.getTime() + 14 * 86_400_000);
  return {
    name: "",
    schoolName: "",
    opens: localDate(now),
    closes: `${localDate(close)}T20:00`,
    nonprofit: null,
    allowCustomSquads: true,
    socialHandle: "",
    approverName: "",
  };
}

let draftCache: Draft | null = null;
const draftListeners = new Set<() => void>();
function readDraft(): Draft {
  if (draftCache) return draftCache;
  try {
    const raw = sessionStorage.getItem(KEY);
    draftCache = raw ? { ...freshDraft(), ...JSON.parse(raw) } : freshDraft();
  } catch {
    draftCache = freshDraft();
  }
  return draftCache!;
}
function writeDraft(patch: Partial<Draft>) {
  draftCache = { ...readDraft(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draftCache));
  } catch {
    /* ignore */
  }
  draftListeners.forEach((l) => l());
}
const SERVER_DRAFT = freshDraft();
function useDraft(): [Draft, (p: Partial<Draft>) => void] {
  const d = useSyncExternalStore(
    (l) => {
      draftListeners.add(l);
      return () => draftListeners.delete(l);
    },
    readDraft,
    () => SERVER_DRAFT,
  );
  return [d, writeDraft];
}

function SetupHeader({ step, children, back }: { step: number; children: React.ReactNode; back?: string }) {
  return (
    <GradientHeader eyebrow={`Step ${step} of 3`} eyebrowStyle="plain" watermark back={back}>
      <ProgressSteps total={3} current={step} />
      <div className="space-y-3 pt-4">{children}</div>
    </GradientHeader>
  );
}

// ── Step 1: auction details and charity (screen 01) ─────────────────────

export function SetupAuction() {
  const [d, set] = useDraft();
  const router = useRouter();
  const [q, setQ] = useState(d.nonprofit?.name ?? "");
  const [results, setResults] = useState<Nonprofit[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced charity search (Phase 3: Every.org search API).
  useEffect(() => {
    const t = setTimeout(() => searchNonprofits(q).then(setResults), 300);
    return () => clearTimeout(t);
  }, [q]);

  const shown = d.nonprofit && !results.some((r) => r.slug === d.nonprofit!.slug) ? [d.nonprofit, ...results] : results;
  const icons = [<Heart key="h" />, <Gift key="g" />, <UsersRound key="u" />];
  const tones: TileTone[] = ["lime", "sky", "sky"];

  function next() {
    const e: Record<string, string> = {};
    if (d.name.trim().length < 3) e.name = "Give your auction a name";
    if (d.schoolName.trim().length < 2) e.schoolName = "Enter your school's name";
    if (!d.opens) e.opens = "Pick a start date";
    if (!d.closes || new Date(d.closes) <= new Date(`${d.opens}T00:00`)) e.closes = "Closing must be after opening";
    if (!d.nonprofit) e.nonprofit = "Pick the charity that gets the money";
    setErrors(e);
    if (Object.keys(e).length === 0) router.push("/setup/teams");
  }

  return (
    <Screen>
      <SetupHeader step={1}>
        <Headline highlight="auction">Set up your</Headline>
        <HeaderSubtitle>A few details, then let the competition begin.</HeaderSubtitle>
      </SetupHeader>
      <PageBody>
        <TextField label="Auction name" icon={<Tag />} placeholder="Branson Fall Auction" value={d.name} onChange={(e) => set({ name: e.target.value })} error={errors.name} />
        <TextField label="School" icon={<School />} placeholder="Branson" value={d.schoolName} onChange={(e) => set({ schoolName: e.target.value })} error={errors.schoolName} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Bidding opens" icon={<CalendarDays />} type="date" value={d.opens} onChange={(e) => set({ opens: e.target.value })} error={errors.opens} />
          <TextField label="Closes" icon={<Clock />} type="datetime-local" value={d.closes} onChange={(e) => set({ closes: e.target.value })} error={errors.closes} />
        </div>
        <div>
          <TextField
            label="Who gets the money?"
            icon={<Search />}
            placeholder="Search charities"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            hint="Searching 1M+ charities on Every.org"
            error={errors.nonprofit}
            autoComplete="off"
          />
          {shown.length > 0 ? (
            <ListCard className="mt-3" role="radiogroup" aria-label="Charity">
              {shown.slice(0, 5).map((n, i) => {
                const on = d.nonprofit?.slug === n.slug;
                return (
                  <ListRow
                    key={n.slug}
                    role="radio"
                    selected={on}
                    onClick={() => set({ nonprofit: n })}
                    leading={<IconTile tone={on ? "lime" : tones[i % 3]}>{icons[i % 3]}</IconTile>}
                    title={n.name}
                    subtitle={`${n.location} · Verified 501(c)(3)`}
                    trailing={on ? <Check className="size-6 text-green-500" aria-hidden="true" /> : null}
                  />
                );
              })}
            </ListCard>
          ) : q.trim().length >= 2 ? (
            <p className="mt-3 text-center text-sm text-ink-500">No charities match &ldquo;{q}&rdquo;.</p>
          ) : null}
        </div>
        <Callout icon={<ShieldCheck />}>
          Winners pay the charity directly on Every.org. Your school never holds the money.
        </Callout>
        <PrimaryButton variant="gradient" onClick={next}>
          Next: Set Up Teams
        </PrimaryButton>
      </PageBody>
    </Screen>
  );
}

// ── Step 2: teams (screen 02) ────────────────────────────────────────────

const CARD_STYLES = [
  { bg: "from-[#F0FBDF] to-[#E0F7C4]", accent: Trophy, accentLabel: "MVP" },
  { bg: "from-[#E6FAF4] to-[#D3F3EC]", accent: Hand, accentLabel: "#1" },
  { bg: "from-[#EAF4FF] to-[#D9EAFD]", accent: Footprints, accentLabel: "" },
  { bg: "from-[#F1EEFF] to-[#E4E0FB]", accent: ClipboardCheck, accentLabel: "" },
];

function Jersey({ number }: { number: string }) {
  return (
    <svg viewBox="0 0 100 92" className="h-20 w-auto drop-shadow-sm" aria-hidden="true">
      <path
        d="M30 4 L42 4 Q50 12 58 4 L70 4 L96 22 L86 42 L76 36 L76 88 L24 88 L24 36 L14 42 L4 22 Z"
        fill="#0B4FB0"
        stroke="#061C43"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M42 4 Q50 16 58 4" fill="none" stroke="white" strokeWidth="4" />
      <path d="M12 26 L22 20 M88 26 L78 20" stroke="#84E81C" strokeWidth="5" strokeLinecap="round" />
      <text x="50" y="70" textAnchor="middle" fontFamily="var(--font-poppins)" fontWeight="800" fontSize="30" fill="white">
        {number}
      </text>
    </svg>
  );
}

export function SetupTeams() {
  const [d, set] = useDraft();
  const router = useRouter();
  const grades = defaultGradeTeams();

  return (
    <Screen>
      <SetupHeader step={2} back="/setup">
        <Headline highlight="competes?">Who</Headline>
        <HeaderSubtitle>Every student lands on a team automatically. Teams are scored on items and bids per person.</HeaderSubtitle>
      </SetupHeader>
      <PageBody>
        <section>
          <SectionLabel>Default teams</SectionLabel>
          <ul className="space-y-3">
            {grades.map((g, i) => {
              const s = CARD_STYLES[i]!;
              const Accent = s.accent;
              return (
                <li key={g.name} className={cn("flex items-center gap-3 rounded-card border border-white bg-gradient-to-r px-3 py-3", s.bg)}>
                  <div className="relative shrink-0">
                    <Jersey number={String(g.classYear).slice(-2)} />
                    <span className="absolute -right-2 -bottom-1 grid size-9 place-items-center rounded-full bg-white text-green-700 shadow-sm">
                      <Accent className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="ml-2 min-w-0 flex-1 border-l-2 border-navy-800/30 pl-4">
                    <p className="font-display text-xs font-extrabold tracking-wide text-navy-900 italic uppercase">Class of</p>
                    <p className="font-display text-[2rem] leading-none font-extrabold tracking-[-0.04em] text-green-700 italic">{g.classYear}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-2 font-display text-[0.8rem] font-bold",
                      i === 0 ? "bg-green-700 text-white" : "bg-white text-navy-900",
                    )}
                  >
                    {g.label}
                  </span>
                </li>
              );
            })}
            <li className="flex items-center gap-4 rounded-card bg-gradient-to-r from-navy-900 via-[#0B5E6E] to-green-500 px-5 py-5 text-white">
              <svg viewBox="0 0 64 40" className="h-10 w-16 shrink-0" aria-hidden="true" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 30 Q32 40 60 30 Q50 30 46 22 L42 6 Q32 2 22 6 L18 22 Q14 30 4 30Z" />
                <path d="M19 20 Q32 25 45 20" stroke="#84E81C" />
              </svg>
              <p className="flex-1 font-display text-2xl leading-none font-extrabold italic">
                FACULTY
                <br />& STAFF
              </p>
              <p className="max-w-[9ch] text-sm leading-snug">Teachers compete too!</p>
            </li>
          </ul>
        </section>
        <section>
          <SectionLabel>Custom squads</SectionLabel>
          <p className="mb-4 text-ink-500">
            Students can form squads inside their grade: a team, a club, a friend group. Squad points roll up to the grade.
          </p>
          <Toggle
            icon={<UsersRound />}
            label="Let students create squads"
            checked={d.allowCustomSquads}
            onChange={(v) => set({ allowCustomSquads: v })}
          />
        </section>
        <PrimaryButton variant="gradient" onClick={() => router.push("/setup/social")}>
          Next: Connect Instagram
        </PrimaryButton>
      </PageBody>
    </Screen>
  );
}

// ── Step 3: Instagram and approver (no mockup) ───────────────────────────

export function SetupSocial() {
  const [d, set] = useDraft();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function launch(skip: boolean) {
    if (!d.nonprofit || !d.name) {
      router.push("/setup");
      return;
    }
    setBusy(true);
    const handle = d.socialHandle.trim();
    const a = await createAuction({
      name: d.name,
      schoolName: d.schoolName,
      opensAt: new Date(`${d.opens}T00:00`).toISOString(),
      closesAt: new Date(d.closes).toISOString(),
      nonprofit: d.nonprofit,
      allowCustomSquads: d.allowCustomSquads,
      socialHandle: skip || !handle ? null : handle.startsWith("@") ? handle : `@${handle}`,
      approverName: skip ? null : d.approverName.trim() || null,
    });
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    draftCache = null;
    setViewer({ role: "organizer" });
    toast(`${a.name} is live`);
    router.push(`/admin/${a.slug}`);
  }

  return (
    <Screen>
      <SetupHeader step={3} back="/setup/teams">
        <Headline highlight="Instagram">Connect</Headline>
        <HeaderSubtitle>Students make posts. You approve them, then they go out from the school account.</HeaderSubtitle>
      </SetupHeader>
      <PageBody>
        <TextField
          label="School Instagram handle"
          icon={<AtSign />}
          placeholder="bransonschool"
          autoCapitalize="none"
          value={d.socialHandle}
          onChange={(e) => set({ socialHandle: e.target.value.replace(/\s/g, "") })}
          hint="Posts go out from this account. You post them yourself for now; we give you the image and caption."
        />
        <TextField
          label="Who approves posts?"
          icon={<User />}
          placeholder="Ms. Okafor"
          value={d.approverName}
          onChange={(e) => set({ approverName: e.target.value })}
          hint="Students see this name when they send a post for approval."
        />
        <Callout icon={<ShieldCheck />}>
          Nothing posts without approval. Students only ever see first names and last initials.
        </Callout>
        <PrimaryButton variant="gradient" onClick={() => launch(false)} disabled={busy}>
          Launch the auction
        </PrimaryButton>
        <button type="button" onClick={() => launch(true)} disabled={busy} className="w-full py-2 font-display font-bold text-blue-600">
          Skip for now
        </button>
      </PageBody>
    </Screen>
  );
}
