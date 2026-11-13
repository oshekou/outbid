import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Join } from "@/components/screens/Join";

export const metadata = { title: "Join" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Join />
    </Suspense>
  );
}
