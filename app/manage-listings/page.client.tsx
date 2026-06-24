"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/auth/api";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────

type EventType = "remittance" | "concern" | "utility";

interface CalendarEvent {
   id: number;
   date: string;
   type: EventType;
   title: string;
   listingId: number;
   note?: string;
}

type MyListing = {
   id: number;
   title: string;
   hero_image: string | null;
   monthly_rent: string;
   city: string;
   bedrooms: number;
   rating: string | null;
   is_unfinished?: boolean;
};

// ── Calendar constants ────────────────────────────────────

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth() + 1;
const pad = (n: number) => String(n).padStart(2, "0");

const initialEvents: CalendarEvent[] = [
   {
      id: 1,
      date: `${y}-${pad(m)}-05`,
      type: "remittance",
      title: "Rent – Unit A",
      listingId: 0,
      note: "Due this month",
   },
   {
      id: 2,
      date: `${y}-${pad(m)}-10`,
      type: "utility",
      title: "Meralco bill",
      listingId: 0,
      note: "Electricity",
   },
   {
      id: 3,
      date: `${y}-${pad(m)}-15`,
      type: "concern",
      title: "AC repair request",
      listingId: 0,
   },
   {
      id: 4,
      date: `${y}-${pad(m)}-20`,
      type: "utility",
      title: "Internet renewal",
      listingId: 0,
      note: "PLDT",
   },
   {
      id: 5,
      date: `${y}-${pad(m)}-25`,
      type: "remittance",
      title: "Deposit refund check",
      listingId: 0,
   },
];

const eventConfig: Record<
   EventType,
   { label: string; dot: string; tag: string }
> = {
   remittance: {
      label: "Remittance",
      dot: "bg-emerald-500",
      tag: "bg-emerald-50 text-emerald-700 border-emerald-200",
   },
   concern: {
      label: "Concern",
      dot: "bg-amber-400",
      tag: "bg-amber-50 text-amber-700 border-amber-200",
   },
   utility: {
      label: "Utility",
      dot: "bg-blue-400",
      tag: "bg-blue-50 text-blue-700 border-blue-200",
   },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December",
];

// ── Helpers ───────────────────────────────────────────────

function formatRent(value: string | number) {
   return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
   }).format(Number(value));
}

// ── Add Event Modal ───────────────────────────────────────

function AddEventModal({
   selectedDate,
   listings,
   onClose,
   onAdd,
}: {
   selectedDate: string;
   listings: MyListing[];
   onClose: () => void;
   onAdd: (e: CalendarEvent) => void;
}) {
   const [type, setType] = useState<EventType>("remittance");
   const [title, setTitle] = useState("");
   const [listingId, setListingId] = useState<number>(listings[0]?.id ?? 0);
   const [note, setNote] = useState("");

   const handleSubmit = () => {
      if (!title.trim()) return;
      onAdd({
         id: Date.now(),
         date: selectedDate,
         type,
         title: title.trim(),
         listingId,
         note: note.trim() || undefined,
      });
      onClose();
   };

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
         onClick={onClose}
      >
         <div
            className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="flex items-center justify-between mb-5">
               <h3 className="font-semibold text-gray-900 text-sm">
                  Add event
               </h3>
               <span
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'DM Mono', monospace" }}
               >
                  {selectedDate}
               </span>
            </div>

            <div className="space-y-3">
               <div className="flex gap-2">
                  {(["remittance", "concern", "utility"] as EventType[]).map(
                     (t) => (
                        <button
                           key={t}
                           onClick={() => setType(t)}
                           className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                              type === t
                                 ? `${eventConfig[t].tag} border`
                                 : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                           }`}
                        >
                           {eventConfig[t].label}
                        </button>
                     ),
                  )}
               </div>

               <input
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
               />

               {listings.length > 0 && (
                  <select
                     className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
                     value={listingId}
                     onChange={(e) => setListingId(Number(e.target.value))}
                  >
                     {listings.map((l) => (
                        <option key={l.id} value={l.id}>
                           {l.title}
                        </option>
                     ))}
                  </select>
               )}

               <input
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
               />
            </div>

            <div className="flex gap-2 mt-5">
               <button
                  onClick={onClose}
                  className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-700 transition-colors"
               >
                  Add
               </button>
            </div>
         </div>
      </div>
   );
}

// ── Calendar ──────────────────────────────────────────────

function Calendar({
   events,
   onAddEvent,
}: {
   events: CalendarEvent[];
   onAddEvent: (date: string) => void;
}) {
   const today = new Date();
   const [viewYear, setViewYear] = useState(today.getFullYear());
   const [viewMonth, setViewMonth] = useState(today.getMonth());
   const [selectedDay, setSelectedDay] = useState<number | null>(
      today.getDate(),
   );

   const firstDay = new Date(viewYear, viewMonth, 1).getDay();
   const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
   const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
      i < firstDay ? null : i - firstDay + 1,
   );

   const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;

   const eventsByDay: Record<number, CalendarEvent[]> = {};
   events
      .filter((e) => e.date.startsWith(monthKey))
      .forEach((e) => {
         const d = parseInt(e.date.split("-")[2]);
         if (!eventsByDay[d]) eventsByDay[d] = [];
         eventsByDay[d].push(e);
      });

   const prevMonth = () => {
      if (viewMonth === 0) {
         setViewMonth(11);
         setViewYear((value) => value - 1);
      } else {
         setViewMonth((value) => value - 1);
      }
      setSelectedDay(null);
   };

   const nextMonth = () => {
      if (viewMonth === 11) {
         setViewMonth(0);
         setViewYear((value) => value + 1);
      } else {
         setViewMonth((value) => value + 1);
      }
      setSelectedDay(null);
   };

   const selectedDateStr = selectedDay
      ? `${viewYear}-${pad(viewMonth + 1)}-${pad(selectedDay)}`
      : null;

   const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

   const isToday = (d: number) =>
      d === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear();

   return (
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
               onClick={prevMonth}
               className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
            >
               ‹
            </button>
            <p className="text-sm font-semibold text-gray-900">
               {MONTHS[viewMonth]} {viewYear}
            </p>
            <button
               onClick={nextMonth}
               className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
            >
               ›
            </button>
         </div>

         <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d) => (
               <div
                  key={d}
                  className="py-2 text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest"
               >
                  {d}
               </div>
            ))}
         </div>

         <div className="grid grid-cols-7">
            {cells.map((day, i) => {
               if (!day) {
                  return (
                     <div
                        key={`empty-${i}`}
                        className="h-10 border-b border-r border-gray-50 last:border-r-0"
                     />
                  );
               }

               const dayEvents = eventsByDay[day] ?? [];
               const selected = selectedDay === day;
               const types = [...new Set(dayEvents.map((e) => e.type))];

               return (
                  <div
                     key={day}
                     onClick={() => setSelectedDay(selected ? null : day)}
                     className={`h-10 flex flex-col items-center justify-center cursor-pointer border-b border-r border-gray-50 last:border-r-0 relative transition-colors ${
                        selected
                           ? "bg-gray-900"
                           : isToday(day)
                             ? "bg-gray-50"
                             : "hover:bg-gray-50"
                     }`}
                  >
                     <span
                        className={`text-xs font-medium ${selected ? "text-white" : isToday(day) ? "text-gray-900" : "text-gray-700"}`}
                     >
                        {day}
                     </span>
                     {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                           {types.slice(0, 3).map((t) => (
                              <span
                                 key={t}
                                 className={`w-1 h-1 rounded-full ${eventConfig[t].dot} ${selected ? "opacity-80" : ""}`}
                              />
                           ))}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>

         {selectedDay && (
            <div className="border-t border-gray-100 px-5 py-4">
               <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                     {MONTHS[viewMonth]} {selectedDay}
                  </p>
                  {selectedDateStr && (
                     <button
                        onClick={() => onAddEvent(selectedDateStr)}
                        className="text-xs font-medium text-gray-700 hover:text-gray-900"
                     >
                        + Add event
                     </button>
                  )}
               </div>

               {selectedEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">
                     No events for this date.
                  </p>
               ) : (
                  <div className="space-y-2">
                     {selectedEvents.map((event) => (
                        <div
                           key={event.id}
                           className="rounded-lg border border-gray-100 px-3 py-2"
                        >
                           <div className="flex items-center gap-2">
                              <span
                                 className={`w-2 h-2 rounded-full ${eventConfig[event.type].dot}`}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                 {event.title}
                              </span>
                           </div>
                           {event.note && (
                              <p className="mt-1 text-xs text-gray-500">
                                 {event.note}
                              </p>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}

// ── Listing Card ──────────────────────────────────────────

function ListingCard({ listing }: { listing: MyListing }) {
   return (
      <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
         {/* Hero image */}
         <div className="relative h-36 w-full bg-gray-100">
            {listing.hero_image ? (
               <img
                  src={listing.hero_image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
               />
            ) : (
               <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No image
               </div>
            )}
         </div>

         <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
               <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                  {listing.title}
               </h2>
               <span className="shrink-0 text-sm font-semibold text-gray-900">
                  {formatRent(listing.monthly_rent)}
               </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
               <p className="text-xs text-gray-500">{listing.city}</p>
               {listing.is_unfinished !== false ? (
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                     Draft
                  </span>
               ) : (
                  <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                     Published
                  </span>
               )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
               <span>
                  {listing.bedrooms === 0
                     ? "Studio"
                     : `${listing.bedrooms} bed`}
               </span>
               <span>
                  {listing.rating == null
                     ? "No rating"
                     : `⭐ ${listing.rating}`}
               </span>
            </div>

            <div className="mt-3">
               <Link
                  href={`/listings/${listing.id}`}
                  className="block w-full py-1.5 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
               >
                  View
               </Link>
            </div>
         </div>
      </article>
   );
}

// ── Skeleton ──────────────────────────────────────────────

function ListingSkeleton() {
   return (
      <>
         {Array.from({ length: 3 }).map((_, i) => (
            <div
               key={i}
               className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse"
            >
               <div className="h-36 bg-gray-100" />
               <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 mt-3" />
               </div>
            </div>
         ))}
      </>
   );
}

// ── Page ──────────────────────────────────────────────────

export default function ManageListingsClientPage() {
   const [events, setEvents] = useState(initialEvents);
   const [selectedDate, setSelectedDate] = useState<string | null>(null);

   const { data, isLoading, isError } = useQuery({
      queryKey: ["my-listings"],
      queryFn: async () => {
         const res = await fetchApi("/api/listings?mine=true");
         if (!res.ok) throw new Error("Failed to fetch listings");
         const json = await res.json();
         // Handle both paginated { results: [] } and plain array responses
         return (
            Array.isArray(json) ? json : (json.results ?? [])
         ) as MyListing[];
      },
   });

   const listings = data ?? [];

   return (
      <main className="min-h-screen bg-[#fafafa] px-6 py-10">
         <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <section>
               {/* Header */}
               <div className="mb-6 flex items-center justify-between">
                  <div>
                     <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                        Host dashboard
                     </p>
                     <h1 className="text-3xl font-semibold text-gray-900">
                        Manage listings
                     </h1>
                  </div>
                  <Link
                     href="/add-listing"
                     className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                     <span>+</span>
                     <span>Add listing</span>
                  </Link>
               </div>

               {/* Listings grid */}
               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {isLoading && <ListingSkeleton />}

                  {!isLoading && isError && (
                     <div className="col-span-full rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                        Failed to load listings. Please try again.
                     </div>
                  )}

                  {!isLoading && !isError && listings.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-700">
                           No listings yet
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                           Add your first listing to get started
                        </p>
                        <Link
                           href="/add-listing"
                           className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                        >
                           Add listing
                        </Link>
                     </div>
                  )}

                  {!isLoading &&
                     !isError &&
                     listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                     ))}
               </div>
            </section>

            <section>
               <Calendar events={events} onAddEvent={setSelectedDate} />
            </section>
         </div>

         {selectedDate && (
            <AddEventModal
               selectedDate={selectedDate}
               listings={listings}
               onClose={() => setSelectedDate(null)}
               onAdd={(event) => setEvents((prev) => [...prev, event])}
            />
         )}
      </main>
   );
}
