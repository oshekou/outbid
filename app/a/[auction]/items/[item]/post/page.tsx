import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { MakePost } from "@/components/screens/MakePost";

export const metadata = { title: "Make a post" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <MakePost />
    </Suspense>
  );
}
