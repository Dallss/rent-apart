"use client";

import { SlidersHorizontal, X, MapPin, Home, Users, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSearch, { PROPERTY_TYPES } from "@/hooks/useSearch";

export default function Filterbar() {
  const {
    where,
    type,
    numOfGuests,
    open: autocompleteOpen,
    predictions,
    handleLocationChange,
    selectPrediction,
    setType,
    setOpen: setAutocompleteOpen,
    incrementGuests,
    decrementGuests,
    search,
  } = useSearch();

  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    search();
    setModalOpen(false);
  }

  function handleClear() {
    handleLocationChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    setType("any");
    for (let i = numOfGuests; i > 1; i--) decrementGuests();
  }

  // Active filter chips to display
  const activeFilters: { id: string; label: string; onRemove: () => void }[] = [
    ...(where.trim()
      ? [{
          id: "where",
          label: where,
          onRemove: () =>
            handleLocationChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>),
        }]
      : []),
    ...(type !== "any"
      ? [{
          id: "type",
          label: PROPERTY_TYPES[type],
          onRemove: () => setType("any"),
        }]
      : []),
    ...(numOfGuests > 1
      ? [{
          id: "guests",
          label: `${numOfGuests} guests`,
          onRemove: () => { for (let i = numOfGuests; i > 1; i--) decrementGuests(); },
        }]
      : []),
  ];

  return (
    <>
      {/* Bar: fixed pill + scrollable chips row */}
      <div className="w-full bg-white flex items-center gap-0 py-3 px-5 overflow-hidden border-b border-gray-200">

        {/* Filter button — never scrolls */}
        <div className="flex-shrink-0 flex items-center">
          <button
            onClick={() => setModalOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1 rounded-full border border-black bg-white text-sm font-medium hover:shadow-md transition-shadow"
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
            Filters
            {activeFilters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Separator — only shown when there are active filters */}
          {activeFilters.length > 0 && (
            <div className="ml-3 h-5 w-px bg-gray-200 flex-shrink-0" />
          )}
        </div>

        {/* Scrollable chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pl-3 scrollbar-none flex-1">
            <AnimatePresence initial={false}>
              {activeFilters.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="flex-shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs font-medium"
                >
                  <span className="whitespace-nowrap max-w-[120px] truncate">{f.label}</span>
                  <button
                    onClick={f.onRemove}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
                <span className="text-sm font-semibold">Filters</span>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-border)]/60 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Fields */}
              <div className="px-5 py-5 flex flex-col gap-6">

                {/* Location */}
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">
                    <MapPin size={11} />
                    Location
                  </label>
                  <input
                    ref={inputRef}
                    className="w-full bg-[var(--color-border)]/30 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition"
                    placeholder="Search destinations"
                    value={where}
                    autoComplete="off"
                    onChange={handleLocationChange}
                    onFocus={() => setAutocompleteOpen(true)}
                    onBlur={() => setTimeout(() => setAutocompleteOpen(false), 150)}
                    onKeyDown={(e) => e.key === "Escape" && setAutocompleteOpen(false)}
                  />

                  <AnimatePresence>
                    {autocompleteOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-[60]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">
                          Suggestions
                        </p>
                        {where.trim() === "" ? (
                          <p className="text-sm text-gray-400 px-4 py-3">Start typing a location…</p>
                        ) : predictions.length === 0 ? (
                          <p className="text-sm text-gray-400 px-4 py-3">No locations found</p>
                        ) : (
                          predictions.map((prediction) => (
                            <div
                              key={prediction.place_id}
                              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--color-border)]/50 transition-colors"
                              onMouseDown={() => selectPrediction(prediction)}
                            >
                              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-xs">
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

                {/* Property type */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">
                    <Home size={11} />
                    Property type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setType(key as keyof typeof PROPERTY_TYPES)}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                          type === key
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "border-[var(--color-border)] hover:border-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">
                    <Users size={11} />
                    Guests
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementGuests}
                      disabled={numOfGuests <= 1}
                      className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center tabular-nums">
                      {numOfGuests}
                    </span>
                    <button
                      onClick={incrementGuests}
                      className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                    <span className="text-sm text-gray-400">
                      {numOfGuests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-6 pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
                <button
                  onClick={handleClear}
                  className="text-sm underline underline-offset-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}