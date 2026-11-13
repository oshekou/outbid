import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { SetupAuction } from "@/components/screens/Setup";

export const metadata = { title: "Set up your auction" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <SetupAuction />
    </Suspense>
  );
}
