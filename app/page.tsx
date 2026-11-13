import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Callout, Logo, PrimaryButton, SecondaryButton } from "@/components/ui";

const STEPS = [
  {
    img: "/brand/icon-phone.png",
    title: "Students ask",
    body: "Every student gets a personal QR card. They show it to local businesses and ask for one great item.",
  },
  {
    img: "/brand/icon-business.png",
    title: "Businesses donate",
    body: "Two minutes, no account. Students make the business famous with posts on the school's Instagram.",
  },
  {
    img: "/brand/icon-trophy.png",
    title: "The community bids",
    body: "Parents and neighbors bid from their phones and get a text when they're outbid. Grades race on the leaderboard.",
  },
];

/** Marketing landing page. */
export default function Home() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-surface shadow-[0_0_0_1px_var(--color-border)]">
      <header className="bg-header-gradient relative overflow-hidden px-5 pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.5rem))] pb-20 text-white">
        <div className="relative">
          <Logo width={140} priority />
          <h1 className="mt-12 font-display text-[2.9rem] leading-[1.02] font-extrabold tracking-[-0.045em] italic">
            Silent auctions run by <span className="text-lime-400">students.</span>
          </h1>
          <p className="mt-4 max-w-[30ch] text-lg leading-snug text-white/95">
            Local businesses donate, students make them famous, charities get every dollar.
          </p>
          <div className="mt-8 space-y-3">
            <PrimaryButton href="/demo">Try the demo</PrimaryButton>
            <SecondaryButton href="/setup" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              Start an auction
            </SecondaryButton>
          </div>
        </div>
        <svg className="absolute inset-x-0 -bottom-px block h-8 w-full" viewBox="0 0 390 32" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 32V22C120 2 280 0 390 14V32Z" fill="var(--color-surface)" />
        </svg>
      </header>

      <main className="space-y-8 px-5 pt-4 pb-14">
        <section>
          <h2 className="section-label mb-4 text-navy-900">How it works</h2>
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-center gap-4 rounded-card border border-border bg-card p-4">
                <Image src={s.img} alt="" width={72} height={72} className="size-[72px] shrink-0 object-contain" />
                <div>
                  <p className="font-display text-lg font-extrabold text-navy-900">
                    <span className="text-teal-500">{i + 1}.</span> {s.title}
                  </p>
                  <p className="mt-0.5 text-[0.95rem] leading-snug text-ink-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Callout icon={<ShieldCheck />} title="Outbid never touches the money">
          Winners pay the charity directly on Every.org. Your school never holds a dollar.
        </Callout>

        <section className="rounded-card bg-navy-900 px-5 py-6 text-white">
          <p className="font-display text-2xl leading-tight font-extrabold italic">
            Grades compete. <span className="text-lime-400">Everyone wins.</span>
          </p>
          <p className="mt-2 text-white/85">
            Points per person keep it fair for small classes. Teachers can join the fight too.
          </p>
          <PrimaryButton href="/demo" className="mt-5">
            See it in action
          </PrimaryButton>
        </section>

        <footer className="flex items-center justify-between pt-2 text-sm text-ink-500">
          <span>Outbid · High school silent auctions</span>
          <Link href="/demo" className="font-bold text-blue-600">
            Demo
          </Link>
        </footer>
      </main>
    </div>
  );
}
