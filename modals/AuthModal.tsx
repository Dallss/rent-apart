"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/providers/AuthProvider";
import { useRef } from "react";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signInWithGoogleCredential } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xs rounded bg-white p-6 shadow-2xl flex flex-col gap-4"
      >
        {/* Header */}
        <h2 className="text-xl font-semibold text-center">
          Sign in Required
        </h2>

       {/* Sign in */}
        <div className="w-full flex justify-center">
          <div className="w-full [&>div]:w-full [&_iframe]:w-full">
            <GoogleLogin
              onSuccess={(cred: CredentialResponse) => {
                if (cred.credential) {
                  signInWithGoogleCredential(cred.credential);
                }
              }}
              onError={() => console.log("Login Failed")}
              theme="outline"
              size="large"
            />
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-primary hover:bg-primary/70 transition text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}