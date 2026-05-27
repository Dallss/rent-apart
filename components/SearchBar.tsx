"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import NextLink from "next/link";

const CITIES = [
  // Featured
  {
    name: "University of the Philippines Cebu",
    region: "Cebu City",
    emoji: "🎓",
    featured: true,
  },

  // Cebu Universities
  {
    name: "University of San Carlos",
    region: "Cebu City",
    emoji: "🏛️",
  },
  {
    name: "Cebu Institute of Technology - University",
    region: "Cebu City",
    emoji: "💡",
  },
  {
    name: "University of Cebu",
    region: "Cebu City",
    emoji: "📘",
  },
  {
    name: "University of San Jose-Recoletos",
    region: "Cebu City",
    emoji: "⛪",
  },
  {
    name: "Cebu Doctors' University",
    region: "Mandaue City",
    emoji: "🩺",
  },
  {
    name: "Southwestern University PHINMA",
    region: "Cebu City",
    emoji: "🧪",
  },
  {
    name: "Velez College",
    region: "Cebu City",
    emoji: "📚",
  },

  // Cities
  {
    name: "Cebu City",
    region: "Central Visayas",
    emoji: "🌊",
  },
  {
    name: "Lapu-Lapu City",
    region: "Central Visayas",
    emoji: "🪸",
  },
  {
    name: "Mandaue City",
    region: "Central Visayas",
    emoji: "🏗️",
  },
  {
    name: "Manila",
    region: "Metro Manila",
    emoji: "🏙️",
  },
  {
    name: "Makati",
    region: "Metro Manila",
    emoji: "🏢",
  },
  {
    name: "Taguig",
    region: "Metro Manila",
    emoji: "🌆",
  },
  {
    name: "Quezon City",
    region: "Metro Manila",
    emoji: "🏘️",
  },
  {
    name: "Davao City",
    region: "Davao Region",
    emoji: "🌴",
  },
  {
    name: "Iloilo City",
    region: "Western Visayas",
    emoji: "🎭",
  },
  {
    name: "Cagayan de Oro",
    region: "Northern Mindanao",
    emoji: "🌿",
  },
  {
    name: "Bacolod",
    region: "Western Visayas",
    emoji: "🎉",
  },
  {
    name: "Baguio",
    region: "Cordillera",
    emoji: "⛰️",
  },
  {
    name: "Zamboanga",
    region: "Zamboanga Peninsula",
    emoji: "⚓",
  },
  {
    name: "Boracay",
    region: "Aklan",
    emoji: "🏖️",
  },
  {
    name: "Palawan",
    region: "MIMAROPA",
    emoji: "🐚",
  },
  {
    name: "Tagaytay",
    region: "Cavite",
    emoji: "🌋",
  },
];

export default function SearchBar() {
  const [type, setType] = useState("Any type");
  const [where, setWhere] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 200], [1, 0.9]);

  const MAX_DEFAULT = 5;   // shown when input is empty
const MAX_SEARCH  = 8;   // shown while typing

const filtered = where.trim()
  ? CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(where.toLowerCase()) ||
        c.region.toLowerCase().includes(where.toLowerCase())
    ).slice(0, MAX_SEARCH)
  : CITIES.slice(0, MAX_DEFAULT);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [where]);

  if (pathname !== "/") return null;

  return (
    <div className="sticky top-2 z-30 flex justify-center m-5 p-1">
      <motion.div
        style={{ scale }}
        className="flex items-center w-full max-w-3xl origin-center bg-[var(--color-surface)] rounded-full shadow-sm border border-[var(--color-border)] overflow-visible"
      >
        {/* WHERE */}
        <div className="flex-1 px-5 py-2 relative">
          <p className="text-xs font-semibold">Where</p>
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Search destinations"
            value={where}
            autoComplete="off"
            onChange={(e) => { setWhere(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && highlightIndex >= 0) {
                setWhere(filtered[highlightIndex].name);
                setOpen(false);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-3 w-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">
                  {where.trim() ? "Results" : "Popular in Philippines"}
                </p>

                {filtered.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-3">No cities found</p>
                ) : (
                  filtered.map((city, i) => (
                    <div
                      key={city.name}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        i === highlightIndex
                          ? "bg-[var(--color-border)]"
                          : "hover:bg-[var(--color-border)]/50"
                      }`}
                      onMouseDown={() => { setWhere(city.name); setOpen(false); }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${city.featured ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
                        {city.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm ${city.featured ? "font-semibold" : "font-medium"}`}>
                          {city.name}
                        </span>
                        <span className="text-xs text-gray-400">{city.region}</span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            <option>Condo</option>
            <option>Studio</option>
          </select>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* WHO */}
        <div className="flex items-center flex-1">
          <div className="flex-1 px-6">
            <p className="text-xs font-semibold">Who</p>
            <input className="w-full bg-transparent outline-none text-sm" placeholder="Add guests" />
          </div>


        <NextLink
          href="/"
          className="mr-2 h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white"
        >
          <Search size={18} />
        </NextLink>
        </div>
      </motion.div>
    </div>
  );
}