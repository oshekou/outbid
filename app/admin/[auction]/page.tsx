import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Admin } from "@/components/screens/Admin";

export const metadata = { title: "Organizer" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Admin />
    </Suspense>
  );
}
