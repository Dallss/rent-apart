import { requireCompletedOnboarding } from "@/lib/auth/server";

export default async function BecomeHostLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   await requireCompletedOnboarding();
   return children;
}
