import { Suspense } from "react";
import LikedListingsClientPage from "./page.client";

export default function LikedListingsPage() {
   return (
      <Suspense fallback={null}>
         <LikedListingsClientPage />
      </Suspense>
   );
}
