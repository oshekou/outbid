import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { TeamLeaderboard } from "@/components/screens/TeamLeaderboard";

export const metadata = { title: "Team leaderboard" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <TeamLeaderboard />
    </Suspense>
  );
}
