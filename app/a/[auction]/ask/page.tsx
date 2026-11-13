import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { AskCard } from "@/components/screens/AskCard";

export const metadata = { title: "Ask card" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <AskCard />
    </Suspense>
  );
}
