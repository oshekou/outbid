import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { Me } from "@/components/screens/Me";

export const metadata = { title: "Me" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <Me />
    </Suspense>
  );
}
