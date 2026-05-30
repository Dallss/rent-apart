"use client";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
};

export default function AuthModal({
  open,
  onClose,
  onGoogleSignIn,
}: AuthModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        
        {/* Header */}
        <div className="mb-5 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Sign in required
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You need an account to continue
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={onGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition"
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}