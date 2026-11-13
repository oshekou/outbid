import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { SetupSocial } from "@/components/screens/Setup";

export const metadata = { title: "Connect Instagram" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <SetupSocial />
    </Suspense>
  );
}
