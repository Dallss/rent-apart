"use client";

import { useAuth } from "@/lib/auth-context";
import { getGoogleClientId } from "@/lib/env";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

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
      <span className="inline-flex max-w-[18rem] items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
        Checking session…
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <span
        className="inline-flex max-w-[18rem] truncate rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-foreground"
        title={userEmail ?? undefined}
      >
        {userEmail ?? "Signed in"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
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

export function AuthToolbar() {
  const { ready, isSignedIn, userEmail, authError, clearAuthError, signOut } =
    useAuth();

  const [gsiReady, setGsiReady] = useState(false);
  const clientId = getGoogleClientId();

  const showConfigHint = ready && !clientId;

  return (
    <header className="sticky top-0 z-20 border-border bg-background/90 px-4 py-3 backdrop-blur-md h-[100px]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            Rent Apart
          </span>

          <AuthStatusPill
            ready={ready}
            isSignedIn={isSignedIn}
            userEmail={userEmail}
          />
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">

          {authError && (
            <div className="flex max-w-md flex-col gap-1 text-xs">
              <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-400">
                {authError}
              </span>

              <button
                onClick={clearAuthError}
                className="text-muted underline underline-offset-2 hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}

          {showConfigHint && (
            <span className="text-xs text-amber-500">
              Set NEXT_PUBLIC_GOOGLE_CLIENT_ID for Google sign-in.
            </span>
          )}

          {isSignedIn && (
            <button
              onClick={signOut}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-card transition"
            >
              Sign out
            </button>
          )}

          <GoogleSignInSlot disabled={!gsiReady} />
        </div>
      </div>

      {clientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGsiReady(true)}
        />
      )}
    </header>
  );
}