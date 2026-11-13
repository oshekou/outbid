import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { SetupTeams } from "@/components/screens/Setup";

export const metadata = { title: "Set up teams" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <SetupTeams />
    </Suspense>
  );
}
