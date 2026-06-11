import { Suspense } from "react";
import ListingsPage from "./components/ListingsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ListingsPage />
    </Suspense>
  );
}