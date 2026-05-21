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
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canManageLeases, setCanManageLeases] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
      /* ignore */
    }
  }, []);

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
    }),
    [ready, isSignedIn, userEmail, canManageLeases, authError, clearAuthError, signInWithGoogleCredential, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}