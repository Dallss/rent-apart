"use client";

import AuthModal from "@/modals/AuthModal";
import {
   getCurrentSession,
   postGoogleIdToken,
   logout,
   likeListingApi,
   unlikeListingApi,
   type AuthProfile,
} from "@/lib/auth";
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";

function isHost(profile: AuthProfile | null): boolean {
   return profile?.capabilities.leasing.manage ?? false;
}

type AuthContextValue = {
   ready: boolean;
   loading: boolean;
   isSignedIn: boolean;
   profile: AuthProfile | null;
   userEmail: string | null;
   isHost: boolean;
   needsOnboarding: boolean;
   likedListings: number[];
   toggleLike: (listingId: number) => Promise<void>;
   authError: string | null;
   clearAuthError: () => void;
   refreshSession: () => Promise<void>;
   signInWithGoogleCredential: (credential: string) => Promise<void>;
   signOut: () => Promise<void>;
   showAuthModal: boolean;
   setShowAuthModal: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [ready, setReady] = useState(false);
   const [loading, setLoading] = useState(false);
   const [profile, setProfile] = useState<AuthProfile | null>(null);
   const [authError, setAuthError] = useState<string | null>(null);
   const [showAuthModal, setShowAuthModal] = useState(false);

   const clearAuthError = useCallback(() => setAuthError(null), []);

   const refreshSession = useCallback(async () => {
      setLoading(true);

      try {
         const nextProfile = await getCurrentSession();
         setProfile(nextProfile);
         setAuthError(null);
      } catch (err) {
         const message =
            err instanceof Error ? err.message : "Failed to load session";
         setAuthError(message);
         setProfile(null);
      } finally {
         setLoading(false);
         setReady(true);
      }
   }, []);

   const signInWithGoogleCredential = useCallback(
      async (credential: string) => {
         setAuthError(null);
         setLoading(true);

         try {
            await postGoogleIdToken(credential);
            const nextProfile = await getCurrentSession();
            setProfile(nextProfile);
            setShowAuthModal(false);
            setReady(true);
         } catch (err) {
            const message =
               err instanceof Error ? err.message : "Sign-in failed";
            setAuthError(message);
            setProfile(null);
            setReady(true);
            throw err;
         } finally {
            setLoading(false);
         }
      },
      [],
   );

   const toggleLike = useCallback(
      async (listingId: number) => {
         if (!profile) return;
         const alreadyLiked = (profile.liked_listings ?? []).includes(
            listingId,
         );

         // Optimistic update
         setProfile((prev) => {
            if (!prev) return prev;
            const current = prev.liked_listings ?? [];
            return {
               ...prev,
               liked_listings: alreadyLiked
                  ? current.filter((id) => id !== listingId)
                  : [...current, listingId],
            };
         });

         try {
            if (alreadyLiked) {
               await unlikeListingApi(listingId);
            } else {
               await likeListingApi(listingId);
            }
         } catch {
            // Revert by re-syncing with server
            void refreshSession();
         }
      },
      [profile, refreshSession],
   );

   const signOut = useCallback(async () => {
      try {
         await logout();
      } catch {
         // clear local auth state even if the logout request fails
      }

      setProfile(null);
      setAuthError(null);
      setShowAuthModal(false);
      setReady(true);
   }, []);

   useEffect(() => {
      queueMicrotask(() => {
         void refreshSession();
      });
   }, [refreshSession]);

   const value = useMemo<AuthContextValue>(
      () => ({
         ready,
         loading,
         isSignedIn: Boolean(profile),
         profile,
         userEmail: profile?.email ?? null,
         isHost: isHost(profile),
         needsOnboarding: profile?.needs_onboarding ?? false,
         likedListings: profile?.liked_listings ?? [],
         toggleLike,
         authError,
         clearAuthError,
         refreshSession,
         signInWithGoogleCredential,
         signOut,
         showAuthModal,
         setShowAuthModal,
      }),
      [
         ready,
         loading,
         profile,
         toggleLike,
         authError,
         clearAuthError,
         refreshSession,
         signInWithGoogleCredential,
         signOut,
         showAuthModal,
      ],
   );

   return (
      <AuthContext.Provider value={value}>
         {children}
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
