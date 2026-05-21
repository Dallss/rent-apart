"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [type, setType] = useState("Any type");

  return (
    <div className="w-full flex justify-center p-6">
      <div
        className="
          flex items-center
          w-full max-w-4xl
          bg-[var(--color-surface)]
          rounded-full
          shadow-sm
          border border-[var(--color-border)]
          overflow-hidden
        "
      >
        {/* WHERE */}
        <div className="flex-1 px-6 py-3 hover:bg-[var(--color-muted)]/10 transition cursor-pointer">
          <p className="text-xs font-semibold text-[var(--color-foreground)]">
            Where
          </p>

          <input
            type="text"
            placeholder="Search place"
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-[var(--color-muted)]
              placeholder:text-[var(--color-muted)]
            "
          />
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* TYPE */}
        <div className="flex-1 px-6 py-3 hover:bg-[var(--color-muted)]/10 transition cursor-pointer">
          <p className="text-xs font-semibold text-[var(--color-foreground)]">
            Type
          </p>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-[var(--color-muted)]
              appearance-none
              cursor-pointer
            "
          >
            <option>Any type</option>
            <option>Apartment</option>
            <option>House</option>
            <option>Villa</option>
            <option>Cabin</option>
            <option>Condo</option>
          </select>
        </div>

        <div className="h-8 w-px bg-[var(--color-border)]" />

        {/* WHO */}
        <div className="flex items-center flex-1">
          <div className="flex-1 px-6 py-3 hover:bg-[var(--color-muted)]/10 transition cursor-pointer">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">
              Who
            </p>

            <input
              type="text"
              placeholder="Add tenants"
              className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-[var(--color-muted)]
                placeholder:text-[var(--color-muted)]
              "
            />
          </div>

          {/* SEARCH BUTTON */}
          <button
            className="
              mr-2
              h-12
              w-12
              rounded-full
              bg-[var(--color-primary)]
              hover:bg-[var(--color-primary-light)]
              transition
              flex items-center justify-center
              text-white
              shadow-sm
            "
          >
            <Search size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}