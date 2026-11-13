import type { ReactNode } from "react";
import { Ban, CircleAlert, Clock, SearchX } from "lucide-react";
import { GradientHeader, Headline, HeaderSubtitle, PageBody, PageShell, PrimaryButton } from "@/components/ui";

/** Loading placeholder shaped like a typical screen: header, stat tiles, cards. */
export function ScreenSkeleton() {
  return (
    <PageShell>
      <div className="bg-header-gradient h-56" aria-hidden="true" />
      <div className="space-y-4 px-5 pt-6" aria-busy="true" aria-label="Loading">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-40" />
        <div className="skeleton h-24" />
      </div>
    </PageShell>
  );
}

/** Full-screen message for not found, error and closed states. */
export function MessageScreen({
  kind,
  title,
  highlight,
  body,
  action,
}: {
  kind: "not-found" | "error" | "closed" | "waiting";
  title: string;
  highlight?: string;
  body: ReactNode;
  action?: { label: string; href: string };
}) {
  const Icon = kind === "not-found" ? SearchX : kind === "closed" ? Ban : kind === "waiting" ? Clock : CircleAlert;
  return (
    <PageShell className="animate-screen-in">
      <GradientHeader>
        <Headline highlight={highlight}>{title}</Headline>
      </GradientHeader>
      <PageBody className="flex flex-col items-center pt-10 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-chip text-navy-800">
          <Icon className="size-9" aria-hidden="true" />
        </span>
        <HeaderSubtitle className="max-w-[30ch] text-ink-500">{body}</HeaderSubtitle>
        {action ? (
          <PrimaryButton href={action.href} variant="gradient" className="mt-4">
            {action.label}
          </PrimaryButton>
        ) : null}
      </PageBody>
    </PageShell>
  );
}

export function NotFound({ what = "page" }: { what?: string }) {
  return (
    <MessageScreen
      kind="not-found"
      title="Hmm, nothing"
      highlight="here."
      body={`We couldn't find that ${what}. The link may be old or mistyped.`}
      action={{ label: "Go to Outbid", href: "/" }}
    />
  );
}
