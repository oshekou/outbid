import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { BusinessDashboard } from "@/components/screens/BusinessDashboard";

export const metadata = { title: "Your dashboard" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <BusinessDashboard />
    </Suspense>
  );
}
