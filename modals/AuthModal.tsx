"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/providers/AuthProvider";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function AuthModal({
   open,
   onClose,
}: {
   open: boolean;
   onClose: () => void;
}) {
   const { signInWithGoogleCredential } = useAuth();
   const router = useRouter();
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
            <h2 className="text-xl font-semibold text-center">
               Sign in Required
            </h2>

            <div className="w-full flex justify-center">
               <div className="w-full [&>div]:w-full [&_iframe]:w-full">
                  <GoogleLogin
                     onSuccess={async (cred: CredentialResponse) => {
                        if (!cred.credential) return;

                        try {
                           await signInWithGoogleCredential(cred.credential);
                           onClose();
                           router.refresh();
                        } catch {
                           // handled by provider state
                        }
                     }}
                     onError={() => console.log("Login Failed")}
                     theme="outline"
                     size="large"
                  />
               </div>
            </div>

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
