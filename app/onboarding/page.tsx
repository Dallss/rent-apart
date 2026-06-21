"use client";

import { submitOnboarding } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type FormState = {
   displayName: string;
   birthday: string;
   phone: string;
};

function normalizePhone(value: string): string {
   return value.replace(/[^\d+]/g, "");
}

export default function OnboardingPage() {
   const router = useRouter();
   const { ready, isSignedIn, needsOnboarding, profile, refreshSession } =
      useAuth();
   const [displayName, setDisplayName] = useState("");
   const [birthday, setBirthday] = useState("");
   const [phone, setPhone] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [submitting, setSubmitting] = useState(false);

   const form = useMemo<FormState>(
      () => ({
         displayName: displayName || profile?.display_name || "",
         birthday: birthday || profile?.birthday || "",
         phone: phone || profile?.phone || "",
      }),
      [displayName, birthday, phone, profile],
   );

   const canSubmit = useMemo(() => {
      return Boolean(
         form.displayName.trim() && form.birthday && form.phone.trim(),
      );
   }, [form]);

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      setSubmitting(true);
      setError(null);

      try {
         await submitOnboarding({
            display_name: form.displayName.trim(),
            birthday: form.birthday,
            phone: normalizePhone(form.phone),
         });

         await refreshSession();
         router.replace("/");
         router.refresh();
      } catch (err) {
         setError(err instanceof Error ? err.message : "Onboarding failed");
      } finally {
         setSubmitting(false);
      }
   };

   useEffect(() => {
      if (!ready) return;
      if (!isSignedIn || !needsOnboarding) {
         router.replace("/");
      }
   }, [ready, isSignedIn, needsOnboarding, router]);

   if (!ready || !isSignedIn || !needsOnboarding) {
      return null;
   }

   return (
      <main className="min-h-screen bg-white px-4 py-16">
         <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card/50 p-8 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
               Account setup
            </p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
               Complete your profile
            </h1>
            <p className="mb-8 text-sm text-muted leading-relaxed">
               We need a few details before you can continue using Rent Apart.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted">
                     Email
                  </label>
                  <input
                     value={profile?.email ?? ""}
                     disabled
                     className="rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm text-muted"
                  />
               </div>

               <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted">
                     Display name
                  </label>
                  <input
                     value={form.displayName}
                     onChange={(e) => setDisplayName(e.target.value)}
                     className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                     placeholder="Your full name"
                  />
               </div>

               <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-semibold uppercase tracking-widest text-muted">
                        Birthday
                     </label>
                     <input
                        type="date"
                        value={form.birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                     />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-semibold uppercase tracking-widest text-muted">
                        Phone
                     </label>
                     <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                        placeholder="09171234567"
                     />
                  </div>
               </div>

               {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                     {error}
                  </p>
               )}

               <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
               >
                  {submitting ? "Saving…" : "Finish setup"}
               </button>
            </form>
         </div>
      </main>
   );
}
