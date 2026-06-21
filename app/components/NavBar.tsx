"use client";

import { useAuth } from "@/providers/AuthProvider";
import { getGoogleClientId } from "@/lib/env";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

function GoogleSignInSlot({ disabled }: { disabled: boolean }) {
   const { isSignedIn, signInWithGoogleCredential } = useAuth();
   const router = useRouter();
   const btnRef = useRef<HTMLDivElement>(null);
   const clientId = getGoogleClientId();
   const initializedRef = useRef(false);

   const handleCredential = useCallback(
      async (response: { credential: string }) => {
         try {
            await signInWithGoogleCredential(response.credential);
            router.refresh();
         } catch {
            // handled by provider state
         }
      },
      [router, signInWithGoogleCredential],
   );

   useEffect(() => {
      if (disabled || isSignedIn || !clientId || !btnRef.current) return;
      if (initializedRef.current) return;

      const el = btnRef.current;
      el.innerHTML = "";

      const g = window.google;
      if (!g?.accounts?.id) return;

      g.accounts.id.initialize({
         client_id: clientId,
         callback: handleCredential,
      });

      g.accounts.id.renderButton(el, {
         type: "standard",
         theme: "outline",
         size: "medium",
         text: "signin_with",
         shape: "pill",
         logo_alignment: "left",
      });

      initializedRef.current = true;

      return () => {
         el.innerHTML = "";
         initializedRef.current = false;
      };
   }, [disabled, isSignedIn, clientId, handleCredential]);

   if (isSignedIn || !clientId) return null;

   return <div ref={btnRef} className="flex min-h-[40px]" />;
}

export function NavBar() {
   const [isScrolled, setIsScrolled] = useState(false);
   const [profileOpen, setProfileOpen] = useState(false);
   const profileRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 80);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            profileRef.current &&
            !profileRef.current.contains(event.target as Node)
         ) {
            setProfileOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   const {
      ready,
      isSignedIn,
      userEmail,
      profile,
      authError,
      clearAuthError,
      signOut,
      isHost,
      needsOnboarding,
   } = useAuth();

   const router = useRouter();
   const [gsiReady, setGsiReady] = useState(false);
   const clientId = getGoogleClientId();
   const pathname = usePathname();

   useEffect(() => {
      if (!ready || !isSignedIn) return;
      if (needsOnboarding && pathname !== "/onboarding") {
         router.replace("/onboarding");
      }
   }, [ready, isSignedIn, needsOnboarding, pathname, router]);

   return (
      <div
         className={`sticky top-0 z-20 flex items-center justify-between px-20 py-4 transition-all duration-300 ${
            pathname === "/"
               ? isScrolled
                  ? "bg-black/40 backdrop-blur-md"
                  : "bg-transparent"
               : "bg-[#F1F5F9] border-b border-[#E5E7EB] text-black"
         }`}
      >
         <div className="flex items-center gap-3">
            <Link
               href="/"
               className="text-base flex items-center gap-2 font-semibold tracking-tight text-[var(--color-foreground)]"
            >
               <Image src="/logo.png" alt="Rent Apart" width={45} height={45} />
               <span
                  className={`text-2xl ${pathname === "/" ? "text-white" : "text-black"}`}
               >
                  Rent Apart
               </span>
            </Link>
         </div>

         <div className="flex items-center gap-2">
            {authError && (
               <div className="flex flex-col gap-1 text-xs">
                  <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 text-red-500">
                     {authError}
                  </span>
                  <button
                     onClick={clearAuthError}
                     className="text-[var(--color-muted)] underline underline-offset-2 hover:text-[var(--color-foreground)]"
                  >
                     Dismiss
                  </button>
               </div>
            )}

            {ready &&
               isSignedIn &&
               needsOnboarding &&
               pathname !== "/onboarding" && (
                  <Link
                     href="/onboarding"
                     className="rounded-full px-4 py-2 text-sm font-medium text-white transition bg-primary"
                  >
                     Complete profile
                  </Link>
               )}

            {ready && isSignedIn && !needsOnboarding && isHost && (
               <Link
                  href="/manage-listings"
                  className="rounded-full border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-muted)]/10 transition bg-primary"
               >
                  Manage properties
               </Link>
            )}

            {ready &&
               isSignedIn &&
               !needsOnboarding &&
               !isHost &&
               pathname !== "/become-a-host" && (
                  <Link
                     href="/become-a-host"
                     className="rounded-full border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-muted)]/10 transition bg-primary"
                  >
                     Become a host
                  </Link>
               )}

            {ready && isSignedIn && (
               <div className="relative" ref={profileRef}>
                  <button
                     onClick={() => setProfileOpen((v) => !v)}
                     className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-white"
                  >
                     <Image
                        src={
                           profile?.avatar_url ||
                           "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                        }
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                     />
                  </button>

                  {profileOpen && (
                     <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-lg">
                        <div className="mb-3 border-b border-gray-200 pb-3">
                           <p className="text-sm font-medium text-black">
                              {profile?.display_name || "Signed in"}
                           </p>
                           <p className="truncate text-xs text-gray-500">
                              {userEmail}
                           </p>
                        </div>

                        {needsOnboarding && (
                           <button
                              onClick={() => {
                                 setProfileOpen(false);
                                 router.push("/onboarding");
                              }}
                              className="mb-2 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                           >
                              Complete onboarding
                           </button>
                        )}

                        <button
                           onClick={async () => {
                              setProfileOpen(false);
                              await signOut();
                              router.refresh();
                              router.replace("/");
                           }}
                           className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                        >
                           Sign out
                        </button>
                     </div>
                  )}
               </div>
            )}

            <GoogleSignInSlot disabled={!gsiReady} />
         </div>

         {clientId && (
            <Script
               src="https://accounts.google.com/gsi/client"
               strategy="afterInteractive"
               onLoad={() => setGsiReady(true)}
            />
         )}
      </div>
   );
}
