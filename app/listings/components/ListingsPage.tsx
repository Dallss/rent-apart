"use client";
import {  useMemo, useState, useEffect } from "react";
import ListingList from "./ListingList";
import Filterbar from "./FilterBar";
import useRuntimeConfig from "@/hooks/useRuntimeConfig";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import dynamicImport from "next/dynamic";

const ListingMap = dynamicImport(() => import("./ListingMap"), {
  ssr: false,
});

// ── Skeleton ─────────────────────────────────────────────
function ListingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-24 w-full rounded-lg bg-zinc-100 animate-pulse"
        />
      ))}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────
export default function Page() {
  const { config } = useRuntimeConfig();
  const [activeId, setActiveId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [currentPlace, setCurrentPlace] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  
  const cityPlaceId = searchParams.get("city_google_place_id");

  useEffect(() => {
    if (!cityPlaceId) {
      console.warn("No city_place_id found in URL");
      return;
    }
  
    if (!window.google?.maps?.places) {
      console.error("Google Places API is not loaded");
      return;
    }
  
    console.log("Fetching coordinates for place:", cityPlaceId);
  
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );
  
    service.getDetails(
      {
        placeId: cityPlaceId,
        fields: ["geometry"],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(
            "PlacesService.getDetails failed",
            {
              placeId: cityPlaceId,
              status,
            }
          );
          return;
        }
  
        if (!place?.geometry?.location) {
          console.error(
            "Place found but geometry.location is missing",
            place
          );
          return;
        }
  
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
  
        console.log("Resolved place coordinates:", {
          placeId: cityPlaceId,
          lat,
          lng,
        });

        const zoom = 11;
  
        setCurrentPlace({ lat, lng, zoom });
      }
    );
  }, [cityPlaceId]);

  const url = useMemo(() => {
    if (!config?.apiUrl) return null;
    return `${config.apiUrl}/api/listings/?${searchParams.toString()}`;
  }, [searchParams, config?.apiUrl]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["listings", url],
    enabled: !!url,
    initialPageParam: url ?? "",
    queryFn: async ({ pageParam }) => {
      const res = await fetch(pageParam);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });

  const listings = useMemo(() => {
    const results = data?.pages.flatMap((p) => p.results) ?? [];

    return results.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      neighborhood: item.city,
      rent: Number(item.monthly_rent),
      bedrooms: Number(item.bedrooms),
      blurb: item.description ?? "",
      image: item.hero_image,
      rating: item.rating == null ? null : String(item.rating),
      lat: Number(item.lat ?? item.latitude),
      lng: Number(item.lng ?? item.longitude),
    }));
  }, [data]);

  const toggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const lazyLoading = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };

  const isEmpty = !isLoading && !isError && listings.length === 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      <div className="flex flex-col w-[45%] overflow-hidden shadow-sm">
        <Filterbar />
        
         {/* LISTINGS */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && <ListingSkeleton />}

          {!isLoading && isError && (
            <div className="p-6 text-sm text-red-500 space-y-3">
              <p>{error?.message ?? "Failed to load listings"}</p>
              <button
                onClick={() => refetch()}
                className="text-xs px-3 py-1 rounded bg-red-50 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm px-6 text-center">
              <p className="font-medium">No listings found</p>
              <p className="text-xs mt-1">
                Try adjusting filters or changing your search
              </p>
            </div>
          )}

          {!isLoading && !isError && listings.length > 0 && (
            <ListingList
              listings={listings}
              activeId={activeId}
              onSelect={toggle}
              lazyLoading={lazyLoading}
            />
          )}

          {isFetchingNextPage && (
            <div className="p-3 text-xs text-zinc-400 animate-pulse">
              Loading more...
            </div>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        <ListingMap
          listings={listings}
          activeId={activeId}
          onSelect={toggle}
          flyto={currentPlace}
        />
      </div>
    </div>
  );
}