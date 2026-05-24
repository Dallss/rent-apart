"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SearchBar() {
  const [type, setType] = useState("Any type");
  const pathname = usePathname();

  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 200], [1, 0.9]);

  if (pathname !== "/") return null;

  return (
    <div className="sticky top-2 z-30 flex justify-center m-5 p-1">
      
      {/* THIS is the actual bar */}
      <motion.div
        style={{ scale }}
        className="
          flex items-center
          w-full max-w-3xl
          origin-center
          bg-[var(--color-surface)]
          rounded-full
          shadow-sm
          border border-[var(--color-border)]
          overflow-hidden
        "
      >
        {/* WHERE */}
        <div className="flex-1 px-5 py-2">
          <p className="text-xs font-semibold">Where</p>
          <input className="w-full bg-transparent outline-none text-sm" />
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* TYPE */}
        <div className="flex-1 px-6">
          <p className="text-xs font-semibold">Type</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          >
            <option>Any type</option>
            <option>Apartment</option>
            <option>House</option>
          </select>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* WHO */}
        <div className="flex items-center flex-1">
          <div className="flex-1 px-6">
            <p className="text-xs font-semibold">Who</p>
            <input className="w-full bg-transparent outline-none text-sm" />
          </div>

          <button
            className="
              mr-2
              h-12 w-12
              rounded-full
              bg-[var(--color-primary)]
              flex items-center justify-center
              text-white
            "
          >
            <Search size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}