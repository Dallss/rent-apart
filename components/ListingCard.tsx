"use client"
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";

type ListingProps = {
   item: {
     id: string;
     title: string;
     neighborhood: string;
     rent: number;
     bedrooms: number;
     blurb: string;
     hero_image?: string;
     rating: string | null;
   };
 };
 
function formatRent(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingCard({ item }: ListingProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  function toggleFavorite() {
    setIsFavorite((prev) => !prev);
  }

  return (
    <article className="flex h-full flex-col w-[210px] overflow-hidden p-[10px]">
      <div className="relative aspect-square overflow-hidden w-full rounded-xl mb-[5px] shadow-xs">
        
        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite();
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1 backdrop-blur hover:bg-white transition"
          aria-label="Toggle favorite"
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
          <Image
            src={item.hero_image}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-[14px] font-[510] truncate">{item.title}</p>

        <dl className="flex flex-col text-[11px] text-zinc-500 leading-tight">
          <div className="flex items-center justify-between gap-1 text-[12px]">
            <span className="truncate">{item.neighborhood}</span>
            <span className="text-zinc-500">
              {item.rating == null ? "No rating" : `⭐ ${item.rating}`}
            </span>
          </div>

          <div className="flex items-center justify-between mt-[2px] text-[12px]">
            <span>
              {item.bedrooms === 0 ? "Studio" : `${item.bedrooms} bed`}
            </span>
            <dd className="font-medium text-zinc-700">
              {formatRent(item.rent)} / mo
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}