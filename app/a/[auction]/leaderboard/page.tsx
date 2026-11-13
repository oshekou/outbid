import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Leaderboard } from "@/components/screens/Leaderboard";

export const metadata = { title: "Leaderboard" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Leaderboard />
    </Suspense>
  );
}
