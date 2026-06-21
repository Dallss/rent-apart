import { requireHostUser } from "@/lib/auth/server";
import ManageListingsClientPage from "./page.client";

export default async function ManageListingsPage() {
   await requireHostUser();
   return <ManageListingsClientPage />;
}
