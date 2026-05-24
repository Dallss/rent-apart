"use client";

import { useAuth } from "@/lib/auth-context";
import { getGoogleClientId } from "@/lib/env";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";


function AuthStatusPill({
  ready,
  isSignedIn,
  userEmail,
}: {
  ready: boolean;
  isSignedIn: boolean;
  userEmail: string | null;
}) {
  if (!ready) {
    return (
      <span className="inline-flex max-w-[18rem] items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
        Checking session…
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <span
        className="inline-flex max-w-[18rem] truncate rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1 text-xs  text-[var(--color-foreground)]"
        title={userEmail ?? undefined}
      >
        {userEmail ?? "Signed in"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
      Signed out
    </span>
  );
}

function GoogleSignInSlot({ disabled }: { disabled: boolean }) {
  const { isSignedIn, signInWithGoogleCredential } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

  const handleCredential = useCallback(
    (response: { credential: string }) => {
      void signInWithGoogleCredential(response.credential);
    },
    [signInWithGoogleCredential],
  );

  useEffect(() => {
    if (disabled || isSignedIn || !clientId || !btnRef.current) return;

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

    return () => {
      el.innerHTML = "";
    };
  }, [disabled, isSignedIn, clientId, handleCredential]);

  if (isSignedIn || !clientId) return null;

  return <div ref={btnRef} className="flex min-h-[40px]" />;
}

export function NavBar() {

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const {
    ready,
    isSignedIn,
    userEmail,
    authError,
    clearAuthError,
    signOut,
    isHost,
  } = useAuth();

  const [gsiReady, setGsiReady] = useState(false);
  const clientId = getGoogleClientId();
  const pathname = usePathname();

  const showConfigHint = ready && !clientId;

  return (
    <div className={`sticky top-0 z-20 flex items-center justify-between px-20 py-4 transition-all duration-300 ${
      pathname === "/"
        ? isScrolled ? "bg-black/40 backdrop-blur-md" : "bg-transparent"
        : "bg-black/40 backdrop-blur-md"
    }`}>
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-base flex items-center gap-2 font-semibold tracking-tight text-[var(--color-foreground)]"
          >
            <Image src="/logo.png" alt="Rent Apart" width={45} height={45} /> <span className="text-2xl text-white">Rent Apart</span>
          </Link>

          {/* <AuthStatusPill
            ready={ready}
            isSignedIn={isSignedIn}
            userEmail={userEmail}
          /> */}
        </div>

        {/* RIGHT */}
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

          {showConfigHint && (
            <span className="text-xs text-amber-500">
              Set NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </span>
          )}

          {isSignedIn && isHost && (
            <Link
              href="/manage-listings"
              className="
                rounded-full
                border-[var(--color-border)]
                px-4 py-2
                text-sm font-medium
                text-white
                hover:bg-[var(--color-muted)]/10
                transition
                bg-primary
              "
            >
              Manage properties
            </Link>
          )}

          {isSignedIn && !isHost && pathname !== "/become-a-host" && (
            <Link
              href="/become-a-host"
              className="
                rounded-full
                border-[var(--color-border)]
                px-4 py-2
                text-sm font-medium
                text-white
                hover:bg-[var(--color-muted)]/10
                transition
                bg-primary
              "
            >
              Become a host
            </Link>
          )}

          {isSignedIn && (
            <button
              onClick={signOut}
              className="
                rounded-full
                border border-[var(--color-border)]
                px-4 py-2
                text-xs font-medium
                text-[var(--color-foreground)]
                hover:bg-[var(--color-muted)]/10
                transition
                bg-white
              "
            >
              Sign out
            </button>
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