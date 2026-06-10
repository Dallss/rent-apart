"use client";

import Map, { Marker, useMap } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect } from "react";

// Inner component so it can use useMap()
function Markers({ listings, activeId, onSelect }: any) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!activeId || !map) return;
    const listing = listings.find((l: any) => l.id === activeId);
    if (!listing?.lat || !listing?.lng) return;

    map.flyTo({
      center: [listing.lng, listing.lat],
      zoom: 15,
      duration: 800,
    });
  }, [activeId]);

  return listings?.map((listing: any) => {
    if (!listing.lat || !listing.lng) return null;
    const isActive = listing.id === activeId;

    return (
      <Marker
        key={listing.id}
        latitude={listing.lat}
        longitude={listing.lng}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          onSelect(listing.id);
        }}
      >
        <div
          className={`
            px-2 py-1 rounded-full text-xs font-semibold cursor-pointer
            shadow-md transition-all duration-150
            ${isActive
              ? "bg-zinc-900 text-white scale-110"
              : "bg-white text-zinc-800 hover:bg-zinc-900 hover:text-white"
            }
          `}
        >
          ₱{listing.rent.toLocaleString()}
        </div>
      </Marker>
    );
  });
}

export default function ListingMap({ listings, activeId, onSelect }: any) {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-50 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">Loading map...</span>
        </div>
      )}

      <Map
        id="listingMap"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          latitude: 10.3157,
          longitude: 123.8854,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/standard"
        onLoad={() => setMapLoaded(true)}
      >
        <Markers listings={listings} activeId={activeId} onSelect={onSelect} />
      </Map>
    </div>
  );
}