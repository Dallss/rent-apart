"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import useSearch from "@/hooks/useSearch";

export default function SearchBar() {
  const {
    place,
    autocompleteOpen,
    predictions,
    handlePlaceChange,
    selectPrediction,
    setAutocompleteOpen,
    search,

    bedrooms,
    setBedrooms,

    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 200], [1, 0.9]);

  const [priceOpen, setPriceOpen] = useState(false);

  return (
    <div className="sticky top-2 z-30 flex justify-center m-1 p-1">
      <motion.div
        style={{ scale }}
        className="flex items-center w-auto origin-center bg-[var(--color-surface)] rounded-full shadow-sm border border-[var(--color-border)] overflow-visible"
      >
        {/* WHERE */}
        <div className="min-w-[300px] px-5 py-2 relative">
          <p className="text-xs font-semibold">Where</p>

          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Search destinations"
            value={place}
            autoComplete="off"
            onChange={handlePlaceChange}
            onFocus={() => setAutocompleteOpen(true)}
            onBlur={() => setTimeout(() => setAutocompleteOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAutocompleteOpen(false);
              if (e.key === "Enter") search();
            }}
          />

          <AnimatePresence>
            {autocompleteOpen && (
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

                {place.trim() === "" ? (
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

        {/* BEDROOMS */}
        <div className="px-5 py-2 min-w-[160px]">
          <p className="text-xs font-semibold">Bedrooms</p>

          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-600 cursor-pointer appearance-none"
          >
            <option value="">Any</option>
            <option value="0">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* PRICE RANGE (ONE FIELD) */}
        <div className="relative px-5 py-2 min-w-[220px]">
          <p className="text-xs font-semibold">Price Range</p>

          <button
            onClick={() => setPriceOpen((v) => !v)}
            className="w-full text-left text-sm text-gray-600 bg-transparent outline-none"
          >
            {minPrice || maxPrice
              ? `₱${minPrice || "0"} - ₱${maxPrice || "Any"}`
              : "Any price"}
          </button>

          <AnimatePresence>
            {priceOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full left-0 mt-3 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-3 z-50"
              >
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Set price range (₱)
                </p>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-[var(--color-border)] rounded-lg px-2 py-1 text-sm outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-[var(--color-border)] rounded-lg px-2 py-1 text-sm outline-none"
                  />
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setPriceOpen(false)}
                    className="text-xs px-3 py-1 rounded-md bg-[var(--color-primary)] text-white"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* SEARCH */}
        <button
          onClick={search}
          className="mr-2 h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition"
        >
          <Search size={18} />
        </button>
      </motion.div>
    </div>
  );
}