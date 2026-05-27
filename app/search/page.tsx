// app/search/page.tsx
"use client";

// NOTE: this page is deactivated due to error im postponing to fix
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import Listing from "@/components/Listing";

// const MOCK_LISTINGS = [
//   {
//     id: "1",
//     title: "Sunshine Residences Studio",
//     neighborhood: "Gorordo Ave, Lahug",
//     rent: 8500,
//     bedrooms: 0,
//     sqft: 22,
//     blurb: "Cozy furnished studio, 4 min walk to UP Cebu",
//     image:
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
//     tags: ["Furnished", "WiFi", "near UP"],
//     distance: "4 min walk",
//     rating: 4.7,
//     lat: 10.3168,
//     lng: 123.8871,
//   },
//   {
//     id: "2",
//     title: "Lahug Garden Flat",
//     neighborhood: "Archbishop Reyes Ave",
//     rent: 12000,
//     bedrooms: 1,
//     sqft: 38,
//     blurb: "Bright 1BR with balcony, utilities included",
//     image:
//       "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
//     tags: ["Balcony", "WiFi", "Utilities incl."],
//     distance: "6 min walk",
//     rating: 4.9,
//     lat: 10.319,
//     lng: 123.8901,
//   },
//   {
//     id: "3",
//     title: "Cityview Transient Room",
//     neighborhood: "Salinas Dr, Lahug",
//     rent: 6500,
//     bedrooms: 1,
//     sqft: 18,
//     blurb: "Affordable room with AC and parking",
//     image:
//       "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
//     tags: ["AC", "Parking"],
//     distance: "8 min walk",
//     rating: 4.5,
//     lat: 10.3145,
//     lng: 123.8855,
//   },
//   {
//     id: "4",
//     title: "Rosario Condo Unit 4F",
//     neighborhood: "Gen. Maxilom Ext.",
//     rent: 18000,
//     bedrooms: 2,
//     sqft: 55,
//     blurb: "Spacious 2BR condo with pool and gym access",
//     image:
//       "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
//     tags: ["Pool", "Gym", "Furnished"],
//     distance: "10 min walk",
//     rating: 4.8,
//     lat: 10.313,
//     lng: 123.884,
//   },
//   {
//     id: "5",
//     title: "Acacia Bedspace (Female)",
//     neighborhood: "Salinas Loop, Lahug",
//     rent: 3800,
//     bedrooms: 1,
//     sqft: 0,
//     blurb: "All-female bedspace near UP, meals optional",
//     image:
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
//     tags: ["All-female", "Meals opt.", "near UP"],
//     distance: "5 min walk",
//     rating: 4.6,
//     lat: 10.316,
//     lng: 123.8865,
//   },
//   {
//     id: "6",
//     title: "Panorama Studio Loft",
//     neighborhood: "Panorama Hills, Lahug",
//     rent: 11500,
//     bedrooms: 0,
//     sqft: 30,
//     blurb: "Quiet loft with city view, great natural light",
//     image:
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
//     tags: ["City view", "Loft bed", "Quiet"],
//     distance: "12 min walk",
//     rating: 4.7,
//     lat: 10.32,
//     lng: 123.892,
//   },
//   {
//     id: "7",
//     title: "Student Haven Room 2",
//     neighborhood: "Gorordo Ave cor. Jakosalem",
//     rent: 5500,
//     bedrooms: 1,
//     sqft: 20,
//     blurb: "Closest room to UP Cebu, quiet and airconditioned",
//     image:
//       "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop",
//     tags: ["near UP", "Quiet", "AC"],
//     distance: "3 min walk",
//     rating: 4.4,
//     lat: 10.3155,
//     lng: 123.8848,
//   },
//   {
//     id: "8",
//     title: "Cebu IT Park Adjacent 1BR",
//     neighborhood: "Apas, Lahug",
//     rent: 15000,
//     bedrooms: 1,
//     sqft: 42,
//     blurb: "Fully furnished 1BR near IT Park and UP Cebu",
//     image:
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
//     tags: ["Near IT Park", "Secured", "Fully furnished"],
//     distance: "15 min walk",
//     rating: 4.8,
//     lat: 10.3175,
//     lng: 123.891,
//   },
// ];

// // ── Leaflet Map (no install needed) ───────────────────────
// function LeafletMap({
//   listings,
//   activeId,
//   onSelect,
// }: {
//   listings: typeof MOCK_LISTINGS;
//   activeId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const mapRef = useRef<any>(null);
//   const markersRef = useRef<Record<string, any>>({});
//   const initializedRef = useRef(false);

//   useEffect(() => {
//     if (initializedRef.current) return;
//     initializedRef.current = true;

//     // Inject Leaflet CSS
//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//     document.head.appendChild(link);

//     // Inject Leaflet JS
//     const script = document.createElement("script");
//     script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//     script.onload = () => initMap();
//     document.head.appendChild(script);

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // Update marker styles when activeId changes
//   useEffect(() => {
//     Object.entries(markersRef.current).forEach(([id, marker]) => {
//       const isActive = id === activeId;
//       const el = marker.getElement()?.querySelector(".pin-bubble");
//       if (el) {
//         el.style.background = isActive ? "#15803d" : "#1a1814";
//         el.style.transform = isActive ? "scale(1.15)" : "scale(1)";
//       }
//     });
//   }, [activeId]);

//   function initMap() {
//     const L = (window as any).L;

//     const map = L.map("leaflet-map", {
//       zoomControl: false,
//     }).setView([10.3157, 123.8854], 15);

//     mapRef.current = map;

//     // Clean tile style — CartoDB light
//     L.tileLayer(
//       "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
//       { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }
//     ).addTo(map);

//     L.control.zoom({ position: "bottomright" }).addTo(map);

//     // UP Cebu marker
//     const campusIcon = L.divIcon({
//       className: "",
//       html: `<div style="
//         background:#dcfce7;border:2px solid #15803d;
//         color:#15803d;font-size:10px;font-weight:600;
//         padding:4px 8px;border-radius:8px;
//         white-space:nowrap;font-family:sans-serif;
//         box-shadow:0 2px 8px rgba(0,0,0,0.15);
//       ">🎓 UP Cebu</div>`,
//       iconAnchor: [40, 10],
//     });
//     L.marker([10.3157, 123.8854], { icon: campusIcon }).addTo(map);

//     // Listing pins
//     listings.forEach((l) => {
//       const icon = L.divIcon({
//         className: "",
//         html: `<div class="pin-bubble" style="
//           background:#1a1814;color:#fff;
//           font-size:11px;font-weight:500;
//           padding:5px 11px;border-radius:20px;
//           white-space:nowrap;cursor:pointer;
//           box-shadow:0 2px 8px rgba(0,0,0,0.25);
//           font-family:sans-serif;
//           transition:transform 0.12s,background 0.12s;
//           transform-origin:bottom center;
//         ">₱${l.rent.toLocaleString()}</div>`,
//         iconAnchor: [30, 8],
//       });

//       const marker = L.marker([l.lat, l.lng], { icon })
//         .addTo(map)
//         .on("click", () => onSelect(l.id));

//       markersRef.current[l.id] = marker;
//     });
//   }

//   return (
//     <div
//       id="leaflet-map"
//       style={{ width: "100%", height: "100%", background: "#e8e4dc" }}
//     />
//   );
// }

// ── Page ──────────────────────────────────────────────────
export default function NearUPCebuPage() {
  // const [activeId, setActiveId] = useState<string | null>(null);
  // const listingRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // const toggle = (id: string) => {
  //   setActiveId((prev) => {
  //     const next = prev === id ? null : id;
  //     if (next) {
  //       setTimeout(() => {
  //         listingRefs.current[next]?.scrollIntoView({
  //           behavior: "smooth",
  //           block: "nearest",
  //         });
  //       }, 50);
  //     }
  //     return next;
  //   });
  // };

  // return (
  //   <div className="flex h-[calc(100vh-64px)] overflow-hidden">

  //     {/* ── Listings Panel ── */}
  //     <div className="w-[55%] flex-shrink-0 overflow-y-auto px-6 py-6">
  //       <div className="mb-5">
  //         <h1 className="font-sans font-light tracking-wide sm:text-2xl">
  //           Apartments Near University of the Philippines – Cebu
  //         </h1>
  //         <p className="text-sm text-zinc-400 mt-1">
  //           {MOCK_LISTINGS.length} rentals · Lahug, Cebu City
  //         </p>
  //       </div>

  //       <ul className="flex flex-wrap gap-4">
  //         {MOCK_LISTINGS.map((item) => (
  //           <li
  //             key={item.id}
  //             ref={(el) => { listingRefs.current[item.id] = el; }}
  //             onClick={() => toggle(item.id)}
  //             className={`rounded-2xl border cursor-pointer transition-all ${
  //               activeId === item.id
  //                 ? "border-2 border-zinc-800 shadow-md"
  //                 : "border-zinc-200 hover:border-zinc-300"
  //             }`}
  //           >
  //             <Link
  //               href={`/listings/${item.id}`}
  //               onClick={(e) => e.preventDefault()}
  //             >
  //               <Listing item={item} />
  //             </Link>
  //           </li>
  //         ))}
  //       </ul>
  //     </div>

  //     {/* ── Map Panel ── */}
  //     <div className="flex-1 relative overflow-hidden">
  //       <LeafletMap
  //         listings={MOCK_LISTINGS}
  //         activeId={activeId}
  //         onSelect={toggle}
  //       />
  //     </div>

  //   </div>
  // );

  <p>under dev</p>
}