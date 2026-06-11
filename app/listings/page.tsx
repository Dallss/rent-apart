"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ListingList from "./components/ListingList";
import Filterbar from "./components/FilterBar";
import useRuntimeConfig from "@/hooks/useRuntimeConfig";
import { useSearchParams } from "next/navigation";
import { ListingMapHandle } from "./components/ListingMap";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

import dynamic from "next/dynamic";

const ListingMap = dynamic(
  () => import("./components/ListingMap"),
  { ssr: false }
);


// ── PAGE ──────────────────────────────────────────────────
export default function Page() {
  const { config } = useRuntimeConfig();
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapRef = useRef<ListingMapHandle>(null);

  const searchParams = useSearchParams();

  const placeId = searchParams.get("placeId");

  
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

  const lazyLoading = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };

  const listings = useMemo(() => {
    const results = data?.pages.flatMap((p) => p.results) ?? [];

    return results.map((item: any) => {
      const lat = Number(item.lat ?? item.latitude);
      const lng = Number(item.lng ?? item.longitude);

      return {
        id: String(item.id),
        title: item.title,
        neighborhood: item.city,
        rent: Number(item.monthly_rent),
        bedrooms: Number(item.bedrooms),
        blurb: item.description ?? "",
        image: item.hero_image,
        rating: item.rating == null ? null : String(item.rating),
        lat,
        lng,
      };
    });
  }, [data]);

  const toggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!placeId || !mapRef.current) return;
  
    const service = new google.maps.places.PlacesService(document.createElement("div"));
    service.getDetails({ placeId, fields: ["geometry"] }, (result, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !result?.geometry?.location) return;
      mapRef.current?.flyTo({
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        zoom: 13,
      });
    });
  }, [placeId]);

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">Loading listings...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-500">
        {error?.message ?? "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* LISTINGS */}
      <div className="flex flex-col w-[45%] overflow-y-auto">
        <Filterbar />
        <ListingList
          listings={listings}
          activeId={activeId}
          onSelect={toggle}
          lazyLoading={lazyLoading}
        />
      </div>
    
      {/* MAP */}
      <div className="flex-1 relative">
        <ListingMap
          ref={mapRef}
          listings={listings}
          activeId={activeId}
          onSelect={toggle}
        />
      </div>
    </div>
  );
}