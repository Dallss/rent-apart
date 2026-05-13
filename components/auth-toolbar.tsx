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
      <span className="inline-flex max-w-[min(100%,18rem)] items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Checking session…
      </span>
    );
  }
  if (isSignedIn) {
    const label = userEmail ?? "Signed in";
    return (
      <span
        className="inline-flex max-w-[min(100%,18rem)] items-center truncate rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
        title={userEmail ?? undefined}
      >
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
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
  return <div ref={btnRef} className="flex min-h-[40px] items-center [&>div]:!m-0" />;
}

export function AuthToolbar() {
  const { ready, isSignedIn, userEmail, authError, clearAuthError, signOut } = useAuth();
  const [gsiReady, setGsiReady] = useState(false);
  const clientId = getGoogleClientId();
  const showConfigHint = ready && !clientId;

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-background/90 px-4 py-3 backdrop-blur-md dark:border-zinc-800/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-foreground">Rent Apart</span>
          <AuthStatusPill ready={ready} isSignedIn={isSignedIn} userEmail={userEmail} />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {authError ? (
            <div className="flex max-w-md flex-col gap-1 text-xs sm:items-end">
              <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                {authError}
              </span>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-left text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-foreground sm:text-right"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {showConfigHint ? (
            <span className="text-xs text-amber-800 dark:text-amber-200">
              Set NEXT_PUBLIC_GOOGLE_CLIENT_ID for Google sign-in.
            </span>
          ) : null}
          {isSignedIn ? (
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          ) : null}
          <GoogleSignInSlot disabled={!gsiReady} />
        </div>
      </div>
      {!clientId ? null : (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGsiReady(true)}
        />
      )}
    </header>
  );
}
