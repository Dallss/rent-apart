"use client";

import Link from "next/link";
import { Heart, MoveRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";

export type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  blurb: string;
  image?: string;
  rating: string | null;
  lat: number;
  lng: number;
};

type ListingListProps = {
  listings: Listing[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  lazyLoading?: {
    fetchNextPage: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
  };
};

function formatRent(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingList({
  listings,
  activeId,
  onSelect,
  lazyLoading,
}: ListingListProps) {
  const { isSignedIn, setShowAuthModal } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    itemRefs.current[activeId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeId]);

  function toggleFavorite(id: string) {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const hasMore = lazyLoading?.hasNextPage;
  const loadingMore = lazyLoading?.isFetchingNextPage;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
      <ul className="flex flex-col gap-3 w-full">
        {listings.map((item) => {
          const isFavorite = favorites[item.id];

          return (
            <li
              key={item.id}
              ref={(el) => { itemRefs.current[item.id] = el; }}
              onClick={() => onSelect?.(item.id)}
              className={`transition ${
                activeId === item.id
                  ? "ring-2 ring-zinc-800"
                  : "hover:ring-1 hover:ring-zinc-200"
              }`}
            >
             <div className="block">
                <article className="flex w-full gap-4 border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-sm">
                  {/* Image */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl m-3 mr-0">
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
                          isFavorite ? "fill-red-500 text-red-500" : "text-zinc-700"
                        }`}
                      />
                    </button>

                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-100 text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-zinc-900">{item.title}</h3>
                        <p className="mt-1 truncate text-sm text-zinc-500">{item.neighborhood}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-base font-semibold text-zinc-900">{formatRent(item.rent)}</div>
                        <div className="text-xs text-zinc-500">per month</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                      <span>
                        {item.bedrooms === 0 ? "Studio" : `${item.bedrooms} Bedroom${item.bedrooms > 1 ? "s" : ""}`}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span>{item.rating == null ? "No rating yet" : `⭐ ${item.rating}`}</span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{item.blurb}</p>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/listings/${item.id}`}
                    className={`flex flex-col items-center justify-center gap-1 bg-orange-400 text-white transition-all duration-300 overflow-hidden ${
                      activeId === item.id
                        ? "w-16 px-5 opacity-100"
                        : "w-0 px-0 opacity-0 group-hover:w-16 group-hover:px-5 group-hover:opacity-100"
                    }`}
                  >
                    <MoveRight className="w-5 h-5 stroke-[3]" />
                    <span className="text-xs font-medium tracking-wide whitespace-nowrap">View</span>
                  </Link>
                </article>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => lazyLoading?.fetchNextPage?.()}
            disabled={loadingMore}
            className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}