import { GradientHeader, Headline, HeaderSubtitle, PageBody, PageShell, PrimaryButton } from "@/components/ui";

// Placeholder until the marketing landing page is built in Phase 1 step 4.
export default function Home() {
  return (
    <PageShell>
      <GradientHeader watermark>
        <Headline highlight="by students.">Silent auctions run</Headline>
        <HeaderSubtitle>Local businesses donate, students make them famous, charities get every dollar.</HeaderSubtitle>
      </GradientHeader>
      <PageBody>
        <PrimaryButton href="/dev/components" variant="gradient">
          See the components
        </PrimaryButton>
      </PageBody>
    </PageShell>
  );
}
