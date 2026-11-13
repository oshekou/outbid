import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { PrizePass } from "@/components/screens/PrizePass";

export const metadata = { title: "Prize pass" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <PrizePass />
    </Suspense>
  );
}
