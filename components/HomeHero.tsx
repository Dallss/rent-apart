// components/home-hero.tsx
"use client";

import { usePathname } from "next/navigation";

export default function HomeHero() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <>
      <div className="text-center text-[45px] font-[650] mb-4 mt-10">
        <span className="text-primary">
          <span className="text-black">Make your</span> move easier
        </span>
      </div>

      <div className="text-center text-sm text-[var(--color-muted)]">
        From finding a place to settling in, we make long-term city living simple.
      </div>
    </>
  );
}