import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/app/States";
import { ItemsList } from "@/components/screens/ItemsList";

export const metadata = { title: "Items" };

export default function Page() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <ItemsList />
    </Suspense>
  );
}
