"use client";

import { useEffect, useState } from "react";
import { ServerCrash, LoaderCircle } from "lucide-react";

export default function ListingLoading() {
  const [showSpinupMessage, setShowSpinupMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinupMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <ul className="mb-10 flex w-full overflow-hidden">
        {Array.from({ length: 10 }).map((_, index) => (
          <li key={index} className="shrink-0">
            <article className="flex h-full w-[220px] flex-col overflow-hidden p-3">
              
              {/* Image */}
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200/60 bg-zinc-200/70 shadow-sm animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.8s_linear_infinite]" />
              </div>

              <div className="flex flex-1 flex-col gap-3">
                
                {/* Title */}
                <div className="space-y-2">
                  <div className="h-[15px] w-4/5 rounded-full bg-zinc-200/80 animate-pulse" />
                  <div className="h-[15px] w-2/3 rounded-full bg-zinc-200/60 animate-pulse" />
                </div>

                {/* Location + Price */}
                <div className="flex items-center gap-2">
                  <div className="h-[12px] w-1/2 rounded-full bg-zinc-200/70 animate-pulse" />
                  <div className="ml-auto h-[12px] w-[50px] rounded-full bg-zinc-300/70 animate-pulse" />
                </div>

                {/* Tags */}
                <div className="mt-1 flex gap-2">
                  <div className="h-7 w-14 rounded-full bg-zinc-200/70 animate-pulse" />
                  <div className="h-7 w-16 rounded-full bg-zinc-200/60 animate-pulse" />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {/* Backend spin-up notice */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          showSpinupMessage
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-3xl border border-zinc-200/70 bg-white/85 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 shadow-inner">
            <ServerCrash className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-800">
              Waking up the server...
            </span>

            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              This can take around a minute on free hosting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}