import { requireHostUser } from "@/lib/auth/server";
import AddListingClientPage from "./page.client";

export default async function AddListingPage() {
   await requireHostUser();
   return <AddListingClientPage />;
}
