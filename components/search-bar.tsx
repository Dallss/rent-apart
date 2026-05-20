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
          bg-white
          rounded-full
          shadow-md
          border border-gray-200
          overflow-hidden
        "
      >
        {/* WHERE */}
        <div className="flex-1 px-6 py-3 hover:bg-gray-100 transition cursor-pointer">
          <p className="text-xs font-semibold text-gray-900">Where</p>

          <input
            type="text"
            placeholder="Search place"
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-gray-600
              placeholder:text-gray-400
            "
          />
        </div>

        {/* DIVIDER */}
        <div className="h-8 w-px bg-gray-200" />

        {/* TYPE */}
        <div className="flex-1 px-6 py-3 hover:bg-gray-100 transition cursor-pointer">
          <p className="text-xs font-semibold text-gray-900">Type</p>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-gray-600
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

        {/* DIVIDER */}
        <div className="h-8 w-px bg-gray-200" />

        {/* WHO */}
        <div className="flex items-center flex-1">
          <div className="flex-1 px-6 py-3 hover:bg-gray-100 transition cursor-pointer">
            <p className="text-xs font-semibold text-gray-900">Who</p>

            <input
              type="text"
              placeholder="Add tenants"
              className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-gray-600
                placeholder:text-gray-400
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
              bg-[#FF385C]
              hover:bg-[#e31c5f]
              transition
              flex items-center justify-center
              text-white
              shrink-0
            "
          >
            <Search size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}