"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HomeHero() {
  const pathname = usePathname();

  const { scrollY } = useScroll();

  // Fade out between 0px and 200px scroll
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Optional slight upward movement
  const y = useTransform(scrollY, [0, 200], [0, -40]);

  if (pathname !== "/") return null;

  return (
    <motion.div style={{ opacity, y }}>
      <div className="mb-4 mt-10 text-center text-[45px] font-[650]">
        <span className="text-primary">
          <span className="text-black">Make your</span> move easier
        </span>
      </div>

      <div className="text-center text-sm text-[var(--color-muted)]">
        From finding a place to settling in, we make long-term city living
        simple.
      </div>
    </motion.div>
  );
}