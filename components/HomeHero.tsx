"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HomeHero() {
  const pathname = usePathname();

  const { scrollY } = useScroll();

  // Fade out while scrolling
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Move slightly upward
  const y = useTransform(scrollY, [0, 200], [0, -40]);

  if (pathname !== "/") return null;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      style={{ opacity, y }}
      className="relative z-10 mb-8"
    >
      <div className="mb-4 mt-10 text-center text-[55px] font-[700]">
        <span className="text-white">
          Make your move easier
        </span>
      </div>

      <div className="text-center text-sm text-white tracking-wider">
        From finding a place to settling in, we make long-term city living
        simple.
      </div>
    </motion.div>
  );
}