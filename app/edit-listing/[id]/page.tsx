import { requireHostUser } from "@/lib/auth/server";
import EditListingClientPage from "./page.client";

export default async function EditListingPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   await requireHostUser();
   const { id } = await params;
   return <EditListingClientPage id={id} />;
}
