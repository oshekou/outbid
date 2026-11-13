import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { ItemDetail } from "@/components/screens/ItemDetail";

export const metadata = { title: "Item" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <ItemDetail />
    </Suspense>
  );
}
