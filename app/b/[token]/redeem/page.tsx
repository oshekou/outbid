import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Redeem } from "@/components/screens/Redeem";

export const metadata = { title: "Scan & redeem" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Redeem />
    </Suspense>
  );
}
