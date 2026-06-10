"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";

export default function MarkerClusterLayer({
  listings,
  activeId,
  onSelect,
}: any) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    listings.forEach((l: any) => {
      if (!Number.isFinite(l.lat) || !Number.isFinite(l.lng)) return;

      const isActive = l.id === activeId;

      const marker = L.marker([l.lat, l.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="
            background:${isActive ? "#15803d" : "#1a1814"};
            color:#fff;
            padding:6px 10px;
            border-radius:999px;
            font-size:11px;
            white-space:nowrap;
          ">₱${Number(l.rent).toLocaleString()}</div>`,
        }),
      });

      marker.on("click", () => onSelect(l.id));

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, listings, activeId, onSelect]);

  return null;
}