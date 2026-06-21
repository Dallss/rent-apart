import { requireAuthenticatedUser } from "@/lib/auth/server";

export default async function OnboardingLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   await requireAuthenticatedUser();
   return children;
}
