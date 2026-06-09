"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  blurb: string;
  hero_image?: string;
  rating: string | null;
};

type ListingListProps = {
  items: Listing[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

function formatRent(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingList({
  items,
  activeId,
  onSelect,
}: ListingListProps) {
  const { isSignedIn, setShowAuthModal } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  function toggleFavorite(id: string) {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
      <ul className="flex flex-col gap-3 w-full">
        {items.map((item) => {
          const isFavorite = favorites[item.id];

          return (
            <li
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              className={` transition ${
                activeId === item.id
                  ? "ring-2 ring-zinc-800"
                  : "hover:ring-1 hover:ring-zinc-200"
              }`}
            >
              <Link
                href={`/listings/${item.id}`}
                className="block"
                onClick={(e) => e.preventDefault()}
              >
                <article className="flex w-full gap-4 border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:shadow-sm">
                  
                  {/* Image */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 backdrop-blur transition hover:bg-white"
                    >
                      <Heart
                        className={`h-4 w-4 transition ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-zinc-700"
                        }`}
                      />
                    </button>

                    {item.hero_image ? (
                      <img
                        src={item.hero_image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-100 text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-zinc-900">
                          {item.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {item.neighborhood}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-base font-semibold text-zinc-900">
                          {formatRent(item.rent)}
                        </div>
                        <div className="text-xs text-zinc-500">
                          per month
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                      <span>
                        {item.bedrooms === 0
                          ? "Studio"
                          : `${item.bedrooms} Bedroom${item.bedrooms > 1 ? "s" : ""}`}
                      </span>

                      <span className="text-zinc-300">•</span>

                      <span>
                        {item.rating == null
                          ? "No rating yet"
                          : `⭐ ${item.rating}`}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                      {item.blurb}
                    </p>
                  </div>
                </article>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}