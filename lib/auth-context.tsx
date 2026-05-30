"use client";

import {
  clearStoredSession,
  persistSession,
  postGoogleIdToken,
  readStoredSession,
} from "@/lib/auth-api";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AuthModal from "@/modals/AuthModal";
import Script from "next/script";

type AuthContextValue = {
  ready: boolean;
  isSignedIn: boolean;
  userEmail: string | null;
  isHost: boolean;
  canManageLeases: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  signOut: () => void;

  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canManageLeases, setCanManageLeases] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);

  // -------------------------
  // Load stored session
  // -------------------------
  useEffect(() => {
    startTransition(() => {
      const { accessToken, email, canManageLeases } = readStoredSession();

      setIsSignedIn(Boolean(accessToken));
      setUserEmail(email);
      setCanManageLeases(canManageLeases);
      setReady(true);
    });
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const signInWithGoogleCredential = useCallback(async (credential: string) => {
    setAuthError(null);

    try {
      const data = await postGoogleIdToken(credential);

      persistSession(data, credential);

      const { accessToken, email, canManageLeases } = readStoredSession();

      setIsSignedIn(Boolean(accessToken));
      setUserEmail(email);
      setCanManageLeases(canManageLeases);
      setShowAuthModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setAuthError(message);
    }
  }, []);

  const signOut = useCallback(() => {
    clearStoredSession();

    setIsSignedIn(false);
    setUserEmail(null);
    setCanManageLeases(false);

    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {
      // ignore
    }
  }, []);

  // -------------------------
  // SAFE Google init (FIXED)
  // -------------------------
  useEffect(() => {
    if (!gsiReady) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing Google Client ID");
      return;
    }

    const g = window.google;
    if (!g?.accounts?.id) return;

    g.accounts.id.initialize({
      client_id: clientId,
      callback: (res: any) => {
        signInWithGoogleCredential(res.credential);
      },
    });
  }, [gsiReady, signInWithGoogleCredential]);

  // -------------------------
  // Context value
  // -------------------------
  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isSignedIn,
      userEmail,
      isHost: canManageLeases,
      canManageLeases,
      authError,
      clearAuthError,
      signInWithGoogleCredential,
      signOut,

      showAuthModal,
      setShowAuthModal,
    }),
    [
      ready,
      isSignedIn,
      userEmail,
      canManageLeases,
      authError,
      clearAuthError,
      signInWithGoogleCredential,
      signOut,
      showAuthModal,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Google Identity Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGsiReady(true)}
      />

      {/* Modal */}
      {showAuthModal && (
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}