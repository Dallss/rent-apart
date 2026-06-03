"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signInWithGoogleCredential } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl bg-white p-8 shadow-2xl flex flex-col items-center gap-6">

        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sign in Required</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition text-lg">✕</button>
        </div>

        <GoogleLogin
          onSuccess={(cred: CredentialResponse) => {
            if (cred.credential) {
              signInWithGoogleCredential(cred.credential);
            }
          }}
          onError={() => console.log("Login Failed")}
        />

      </div>
    </div>
  );
}