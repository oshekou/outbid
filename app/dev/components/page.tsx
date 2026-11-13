"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Gift,
  Heart,
  Search,
  Share,
  ShieldCheck,
  Star,
  Tag,
  UsersRound,
} from "lucide-react";
import {
  Avatar,
  Callout,
  Card,
  ChipGroup,
  GradientHeader,
  Headline,
  HeaderSubtitle,
  IconTile,
  InstagramIcon,
  ListCard,
  ListRow,
  Logo,
  PageBody,
  PageShell,
  Pill,
  PrimaryButton,
  ProgressBar,
  ProgressSteps,
  QRCard,
  SecondaryButton,
  SectionLabel,
  StatRow,
  StatTile,
  TabBar,
  TabBarSpacer,
  TextArea,
  TextField,
  Toggle,
} from "@/components/ui";

const swatches = [
  ["navy-900", "#061C43"],
  ["navy-800", "#092B57"],
  ["blue-600", "#0767B3"],
  ["teal-500", "#0E8479"],
  ["green-500", "#1BAA85"],
  ["lime-400", "#84E81C"],
  ["lime-50", "#EDF9DB"],
  ["surface", "#F8FAFF"],
  ["card", "#FFFFFF"],
  ["border", "#DCE3EE"],
] as const;

export default function ComponentsPage() {
  const [tab, setTab] = useState<"grades" | "mine" | "biz">("grades");
  const [amount, setAmount] = useState<"150" | "160" | "175" | "other">("160");
  const [squads, setSquads] = useState(true);
  const [charity, setCharity] = useState("sf");
  const [name, setName] = useState("Branson Fall Auction");

  return (
    <PageShell>
      <GradientHeader eyebrow="Step 1 of 3" eyebrowStyle="plain" watermark>
        <ProgressSteps total={3} current={1} />
        <Headline className="pt-6" highlight="auction">
          Set up your
        </Headline>
        <HeaderSubtitle>A few details, then let the competition begin.</HeaderSubtitle>
      </GradientHeader>

      <PageBody className="space-y-10">
        <p className="rounded-xl bg-navy-900 px-4 py-3 text-sm text-white">
          <strong>/dev/components</strong>: every shared component from BUILD_PLAN.md §4, on mock content. The header above is{" "}
          <code>GradientHeader</code> + <code>ProgressSteps</code> + <code>Headline</code> with the bull watermark.
        </p>

        <Section title="Colour tokens">
          <div className="grid grid-cols-5 gap-2">
            {swatches.map(([n, hex]) => (
              <div key={n} className="text-center">
                <div className="mx-auto size-12 rounded-xl border border-border" style={{ background: hex }} />
                <div className="mt-1 text-[0.65rem] font-bold text-navy-900">{n}</div>
                <div className="text-[0.65rem] text-ink-500">{hex}</div>
              </div>
            ))}
          </div>
          <div className="bg-header-gradient mt-3 h-10 rounded-xl" aria-label="Header gradient" />
          <div className="bg-button-gradient mt-2 h-10 rounded-xl" aria-label="Button gradient" />
        </Section>

        <Section title="Type">
          <div className="space-y-2 rounded-card bg-navy-900 p-5">
            <Headline highlight="side.">Pick your</Headline>
            <Headline as="h2" highlight="Get seen." breakBeforeHighlight className="text-3xl">
              Donate one thing.
            </Headline>
          </div>
          <SectionLabel className="mt-4">Section label</SectionLabel>
          <p className="text-ink-500">Body text is Inter. Headlines are Poppins 800 italic.</p>
        </Section>

        <Section title="Logo">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-navy-900 p-3">
              <Logo variant="white" width={120} />
            </div>
            <Logo variant="color" width={140} />
          </div>
        </Section>

        <Section title="Primary buttons">
          <div className="space-y-3">
            <PrimaryButton>Bid $160</PrimaryButton>
            <PrimaryButton variant="gradient">Next: Set Up Teams</PrimaryButton>
            <PrimaryButton trailingIcon={<Check />}>Redeem Item</PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
        </Section>

        <Section title="Secondary buttons">
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton>+ Create a squad</SecondaryButton>
            <SecondaryButton variant="navy" arrow>
              Go solo
            </SecondaryButton>
            <SecondaryButton variant="lime" icon={<Share />}>
              Share card
            </SecondaryButton>
            <SecondaryButton icon={<Copy />}>Copy link</SecondaryButton>
          </div>
        </Section>

        <Section title="Text fields">
          <div className="space-y-5">
            <TextField label="Auction name" icon={<Tag />} value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Bidding opens" icon={<Calendar />} defaultValue="Jan 20" />
              <TextField label="Closes" icon={<Clock />} defaultValue="Feb 7, 8pm" />
            </div>
            <TextField
              label="Who gets the money?"
              icon={<Search />}
              defaultValue="Marin food"
              hint="Searching 1M+ charities on Every.org"
            />
            <TextField label="Your name" icon={<UsersRound />} placeholder="Olivia S." aside="optional" />
            <TextField label="Retail value" error="Retail value must be at least $5" defaultValue="$2" />
            <TextArea label="One line for the post" defaultValue="Two large pies, salad, drinks, and the back room is yours for two hours." />
          </div>
        </Section>

        <Section title="List card + list rows">
          <ListCard role="radiogroup" aria-label="Charity">
            <ListRow
              role="radio"
              selected={charity === "sf"}
              onClick={() => setCharity("sf")}
              leading={<IconTile tone="lime"><Heart /></IconTile>}
              title="SF-Marin Food Bank"
              subtitle="San Francisco, CA · Verified 501(c)(3)"
              trailing={charity === "sf" ? <Check className="size-6 text-green-500" aria-hidden="true" /> : null}
            />
            <ListRow
              role="radio"
              selected={charity === "mc"}
              onClick={() => setCharity("mc")}
              leading={<IconTile tone="sky"><Gift /></IconTile>}
              title="Marin Community Food Pantry"
              subtitle="San Rafael, CA · Verified 501(c)(3)"
              trailing={charity === "mc" ? <Check className="size-6 text-green-500" aria-hidden="true" /> : null}
            />
            <ListRow
              leading={<IconTile tone="mint"><InstagramIcon /></IconTile>}
              title="@bransonschool story"
              subtitle="Thursday · 1,900 views"
              trailing={<SecondaryButton size="sm" className="w-auto bg-chip">Open</SecondaryButton>}
            />
          </ListCard>
          <ListCard className="mt-4">
            <ListRow leading={<Avatar name="Jamie T." tone="lime" />} title="Jamie T." subtitle="Ross" meta="2 min ago" trailing={<Amount>$140</Amount>} />
            <ListRow leading={<Avatar name="Evan W." tone="sky" />} title="Evan W." subtitle="Kentfield" meta="14 min ago" trailing={<Amount>$130</Amount>} />
            <ListRow leading={<Avatar name="Caroline G." tone="sand" />} title="Caroline G." subtitle="Larkspur" meta="46 min ago" trailing={<Amount>$120</Amount>} />
          </ListCard>
        </Section>

        <Section title="Stat tiles">
          <StatRow>
            <StatTile value="$140" label="Current bid" />
            <StatTile value="18" label="Bids" />
            <StatTile value="$150" label="Retail value" />
          </StatRow>
        </Section>

        <Section title="Chips">
          <ChipGroup
            label="Leaderboard view"
            value={tab}
            onChange={setTab}
            options={[
              { value: "grades", label: "Grades" },
              { value: "mine", label: "My grade" },
              { value: "biz", label: "Businesses" },
            ]}
            trailing={<Pill>6d 4h left</Pill>}
          />
          <ChipGroup
            className="mt-4"
            label="Bid amount"
            layout="fill"
            value={amount}
            onChange={setAmount}
            options={[
              { value: "150", label: "$150" },
              { value: "160", label: "$160" },
              { value: "175", label: "$175" },
              { value: "other", label: "Other" },
            ]}
          />
        </Section>

        <Section title="Callouts">
          <div className="space-y-3">
            <Callout icon={<ShieldCheck />}>Winners pay the charity directly on Every.org. Your school never holds the money.</Callout>
            <Callout icon={<Star />} iconTile>
              Credit goes to <strong className="text-navy-900">Olivia S., Class of 2027.</strong> She asked you, she gets the points.
            </Callout>
            <Callout tone="info" icon={<ShieldCheck />}>
              Goes to Ms. Okafor for approval, then posts from @bransonschool. You get a link to reshare.
            </Callout>
            <Callout title="After the auction">The winner gets a wallet pass. When they come in, scan it or tap Redeem here.</Callout>
          </div>
        </Section>

        <Section title="Toggles">
          <div className="space-y-5">
            <Toggle icon={<UsersRound />} label="Let students create squads" checked={squads} onChange={setSquads} />
            <Card className="bg-chip/60 p-4">
              <Toggle
                label="Set a max and stop checking"
                description="We bid for you in $10 steps up to your max."
                checked={false}
                disabled
                badge="Coming soon"
              />
            </Card>
          </div>
        </Section>

        <Section title="Progress">
          <div className="space-y-3 rounded-card bg-navy-800 p-5">
            <ProgressBar value={1} label="Class of 2027" />
            <ProgressBar value={0.87} label="Faculty and staff" />
            <ProgressBar value={0.4} label="Class of 2030" />
          </div>
        </Section>

        <Section title="Avatars">
          <div className="flex gap-3">
            <Avatar name="Olivia S." tone="gradient" />
            <Avatar name="Jamie T." tone="lime" />
            <Avatar name="Evan W." tone="sky" />
            <Avatar name="Caroline G." tone="sand" />
            <Avatar name="Coach Daniels" tone="navy" />
          </div>
        </Section>

        <Section title="QR card (real, scannable)">
          <Card className="px-5 py-6">
            <QRCard
              value="https://outbid.app/give/branson/olivia"
              displayUrl="outbid.app/give/branson/olivia"
              badge="Olivia S. · Class of 2027"
            />
          </Card>
        </Section>

        <Section title="Tab bar">
          <p className="text-sm text-ink-500">Fixed to the bottom of this page.</p>
        </Section>
        <TabBarSpacer />
      </PageBody>
      <TabBar auctionSlug="branson" active="leaderboard" />
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

function Amount({ children }: { children: React.ReactNode }) {
  return <span className="font-display text-xl font-extrabold tracking-[-0.03em] text-navy-900">{children}</span>;
}
