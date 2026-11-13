import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { DonateItem } from "@/components/screens/DonateItem";

export const metadata = { title: "Donate an item" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <DonateItem />
    </Suspense>
  );
}
