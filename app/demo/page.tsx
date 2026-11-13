import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Demo } from "@/components/screens/Demo";

export const metadata = { title: "Demo" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Demo />
    </Suspense>
  );
}
