"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Sign in</h2>

          <button onClick={onClose}>✕</button>
        </div>

        <GoogleLogin
          onSuccess={(cred) => {
            if ("credential" in cred) {
              signInWithGoogleCredential((cred as any).credential);
            }
          }}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
}