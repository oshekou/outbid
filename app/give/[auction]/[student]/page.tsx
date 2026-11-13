import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { GiveLanding } from "@/components/screens/GiveLanding";

export const metadata = { title: "Donate an item" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <GiveLanding />
    </Suspense>
  );
}
