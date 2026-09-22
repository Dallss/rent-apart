"use client";

import { LoaderCircle, ServerCrash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type BackendStatus = "checking" | "ready" | "error";

const HEALTH_CHECK_URL = "/api/health";
const POLL_INTERVAL_MS = 4000;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS_BEFORE_ERROR = 15; // ~ a minute of retries

async function checkBackendOnce(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(HEALTH_CHECK_URL, {
      cache: "no-store",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function BackendStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const runIdRef = useRef(0);

  const startChecking = useCallback(() => {
    const runId = ++runIdRef.current;
    setStatus("checking");
    setElapsedSeconds(0);

    const startedAt = Date.now();
    const tick = setInterval(() => {
      if (runIdRef.current !== runId) {
        clearInterval(tick);
        return;
      }
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    (async () => {
      let attempts = 0;

      while (runIdRef.current === runId) {
        const ok = await checkBackendOnce();
        if (runIdRef.current !== runId) break;

        if (ok) {
          setStatus("ready");
          clearInterval(tick);
          return;
        }

        attempts += 1;
        if (attempts >= MAX_ATTEMPTS_BEFORE_ERROR) {
          setStatus("error");
          clearInterval(tick);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      clearInterval(tick);
    })();
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      startChecking();
    });
  }, [startChecking]);

  const isBlocking = status !== "ready";

  useEffect(() => {
    if (!isBlocking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isBlocking]);

  return (
    <>
      <div
        // @ts-expect-error -- `inert` is a valid DOM attribute React 19 forwards, but its types aren't listed yet
        inert={isBlocking ? "" : undefined}
        aria-hidden={isBlocking}
        className={isBlocking ? "pointer-events-none select-none" : undefined}
      >
        {children}
      </div>

      {isBlocking && (
        <BackendWakingScreen
          status={status}
          elapsedSeconds={elapsedSeconds}
          onRetry={startChecking}
        />
      )}
    </>
  );
}

function BackendWakingScreen({
  status,
  elapsedSeconds,
  onRetry,
}: {
  status: BackendStatus;
  elapsedSeconds: number;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center gap-5 rounded-3xl border border-zinc-200/70 bg-white/90 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner ${
            status === "error"
              ? "bg-red-100 text-red-500"
              : "bg-orange-100 text-orange-500"
          }`}
        >
          <ServerCrash className="h-6 w-6" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-semibold tracking-tight text-zinc-800">
            {status === "error"
              ? "Still can't reach the server"
              : "Waking up the server..."}
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            {status === "error"
              ? "The backend is taking longer than usual to start. You can keep waiting or try again."
              : "Our backend runs on a free hosting tier that spins down when idle. It's starting back up now — this usually takes under a minute."}
          </p>
        </div>

        {status === "checking" ? (
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            <span>{elapsedSeconds}s elapsed</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
