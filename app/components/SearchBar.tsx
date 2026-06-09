"use client";

import { Search } from "lucide-react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import useSearch, { PROPERTY_TYPES } from "@/hooks/useSearch";

export default function SearchBar() {
  const {
    where,
    type,
    open,
    predictions,
    handleLocationChange,
    selectPrediction,
    setType,
    setOpen,
    search,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 200], [1, 0.9]);

  if (pathname !== "/") return null;

  return (
    <div className="sticky top-2 z-30 flex justify-center m-1 p-1">
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
            onChange={handleLocationChange}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-3 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">
                  Suggested Locations
                </p>

                {where.trim() === "" ? (
                  <p className="text-sm text-gray-400 px-4 py-3">
                    Start typing a location...
                  </p>
                ) : predictions.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-3">
                    No locations found
                  </p>
                ) : (
                  predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--color-border)]/50 transition-colors"
                      onMouseDown={() => selectPrediction(prediction)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        📍
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {prediction.structured_formatting.main_text}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {prediction.structured_formatting.secondary_text}
                        </span>
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
            onChange={(e) => setType(e.target.value as keyof typeof PROPERTY_TYPES)}
            className="w-full bg-transparent outline-none text-sm"
          >
            {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* WHO */}
        <div className="flex items-center flex-1">
          <div className="flex-1 px-6">
            <p className="text-xs font-semibold">Who</p>
            <input
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Add guests"
            />
          </div>

          <button
            onClick={search}
            className="mr-2 h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white"
          >
            <Search size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}