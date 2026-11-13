import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Outbid } from "@/components/screens/Outbid";

export const metadata = { title: "You've been outbid" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Outbid />
    </Suspense>
  );
}
