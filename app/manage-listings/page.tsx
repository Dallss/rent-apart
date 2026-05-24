"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = "remittance" | "concern" | "utility";

interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  listingId: number;
  note?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const listings = [
  { id: 1, title: "Cebu IT Park Studio",     address: "Lahug, Cebu City",              type: "Studio",          bedrooms: 0, bathrooms: 1, area: 28,  price: 18000, minLease: 6,  status: "occupied",    tenant: "Maria Santos",      leaseEnd: "2025-12-31" },
  { id: 2, title: "Ayala Condo Unit 12B",    address: "Cebu Business Park, Cebu City", type: "1 Bedroom",       bedrooms: 1, bathrooms: 1, area: 45,  price: 28000, minLease: 12, status: "available",   tenant: null,                leaseEnd: null },
  { id: 3, title: "Banilad Family Home",     address: "Banilad, Cebu City",            type: "3 Bedroom House", bedrooms: 3, bathrooms: 2, area: 120, price: 55000, minLease: 12, status: "occupied",    tenant: "Dela Cruz Family",  leaseEnd: "2026-03-01" },
  { id: 4, title: "Mandaue Townhouse",       address: "A.S. Fortuna St., Mandaue City",type: "2 Bedroom",       bedrooms: 2, bathrooms: 2, area: 75,  price: 32000, minLease: 6,  status: "expiring",   tenant: "James Reyes",       leaseEnd: "2025-07-15" },
  { id: 5, title: "Mactan Beachside Unit",   address: "Lapu-Lapu City",                type: "2 Bedroom",       bedrooms: 2, bathrooms: 1, area: 58,  price: 38000, minLease: 12, status: "maintenance", tenant: null,                leaseEnd: null },
];

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth() + 1;
const pad = (n: number) => String(n).padStart(2, "0");

const initialEvents: CalendarEvent[] = [
  { id: 1,  date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – Maria Santos",      listingId: 1, note: "₱18,000 due" },
  { id: 2,  date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – Dela Cruz Family",  listingId: 3, note: "₱55,000 due" },
  { id: 3,  date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – James Reyes",       listingId: 4, note: "₱32,000 due" },
  { id: 4,  date: `${y}-${pad(m)}-10`, type: "utility",    title: "Meralco bill – Studio",    listingId: 1, note: "Electricity" },
  { id: 5,  date: `${y}-${pad(m)}-12`, type: "concern",    title: "AC repair request",        listingId: 3, note: "Dela Cruz Family" },
  { id: 6,  date: `${y}-${pad(m)}-15`, type: "utility",    title: "Water bill – Mandaue",     listingId: 4, note: "MCWD" },
  { id: 7,  date: `${y}-${pad(m)}-18`, type: "concern",    title: "Roof leak inspection",     listingId: 4 },
  { id: 8,  date: `${y}-${pad(m)}-20`, type: "utility",    title: "Internet renewal – Ayala", listingId: 2, note: "PLDT" },
  { id: 9,  date: `${y}-${pad(m)}-25`, type: "remittance", title: "Deposit refund check",     listingId: 5 },
  { id: 10, date: `${y}-${pad(m)}-28`, type: "concern",    title: "Plumbing check",           listingId: 1, note: "Tenant request" },
];

const statusConfig = {
  occupied:    { label: "Occupied",      pill: "bg-gray-100 text-gray-700 border border-gray-200",   dot: "bg-emerald-500" },
  available:   { label: "Available",     pill: "bg-gray-100 text-gray-700 border border-gray-200",   dot: "bg-blue-400" },
  expiring:    { label: "Expiring soon", pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
  maintenance: { label: "Maintenance",   pill: "bg-gray-100 text-gray-500 border border-gray-200",   dot: "bg-gray-400" },
};

const eventConfig: Record<EventType, { label: string; dot: string; tag: string }> = {
  remittance: { label: "Remittance", dot: "bg-emerald-500", tag: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  concern:    { label: "Concern",    dot: "bg-amber-400",   tag: "bg-amber-50 text-amber-700 border-amber-200" },
  utility:    { label: "Utility",    dot: "bg-blue-400",    tag: "bg-blue-50 text-blue-700 border-blue-200" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const daysUntil = (d: string | null) =>
  d ? Math.ceil((new Date(d).getTime() - new Date().getTime()) / 86400000) : null;

// ─── Add Event Modal ──────────────────────────────────────────────────────────

function AddEventModal({
  selectedDate,
  onClose,
  onAdd,
}: {
  selectedDate: string;
  onClose: () => void;
  onAdd: (e: CalendarEvent) => void;
}) {
  const [type, setType] = useState<EventType>("remittance");
  const [title, setTitle] = useState("");
  const [listingId, setListingId] = useState(listings[0].id);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-sm">Add event</h3>
          <span className="text-xs text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{selectedDate}</span>
        </div>

        <div className="space-y-3">
          {/* Type */}
          <div className="flex gap-2">
            {(["remittance", "concern", "utility"] as EventType[]).map((t) => (
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
            ))}
          </div>

          {/* Title */}
          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Listing */}
          <select
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            value={listingId}
            onChange={(e) => setListingId(Number(e.target.value))}
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>

          {/* Note */}
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

// ─── Calendar ────────────────────────────────────────────────────────────────

function Calendar({
  events,
  onAddEvent,
}: {
  events: CalendarEvent[];
  onAddEvent: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
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
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
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
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">‹</button>
        <p className="text-sm font-semibold text-gray-900">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-10 border-b border-r border-gray-50 last:border-r-0" />;
          const dayEvents = eventsByDay[day] ?? [];
          const selected = selectedDay === day;
          const types = [...new Set(dayEvents.map((e) => e.type))];

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`h-10 flex flex-col items-center justify-center cursor-pointer border-b border-r border-gray-50 last:border-r-0 relative transition-colors ${
                selected ? "bg-gray-900" : isToday(day) ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <span className={`text-xs font-medium ${selected ? "text-white" : isToday(day) ? "text-gray-900" : "text-gray-700"}`}>
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {types.slice(0, 3).map((t) => (
                    <span key={t} className={`w-1 h-1 rounded-full ${eventConfig[t].dot} ${selected ? "opacity-80" : ""}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {MONTHS[viewMonth]} {selectedDay}
            </p>
            <button
              onClick={() => selectedDateStr && onAddEvent(selectedDateStr)}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 rounded px-2 py-0.5 hover:border-gray-400"
            >
              + Add
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-400">No events. Click + Add to create one.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => {
                const cfg = eventConfig[ev.type];
                const listing = listings.find((l) => l.id === ev.listingId);
                return (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{ev.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {listing?.title}
                        {ev.note && ` · ${ev.note}`}
                      </p>
                    </div>
                    <span className={`ml-auto shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.tag}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "listings" | "calendar";

export default function HostListingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [activeListingId, setActiveListingId] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [addingForDate, setAddingForDate] = useState<string | null>(null);

  const occupied = listings.filter((l) => l.status === "occupied" || l.status === "expiring").length;
  const available = listings.filter((l) => l.status === "available").length;
  const revenue = listings
    .filter((l) => l.status === "occupied" || l.status === "expiring")
    .reduce((s, l) => s + l.price, 0);

  const handleAddEvent = (e: CalendarEvent) => {
    setEvents((prev) => [...prev, e]);
  };

  // Upcoming events (next 14 days)
  const upcoming = events
    .filter((e) => {
      const d = new Date(e.date);
      const diff = (d.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 14;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f9f9f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      {addingForDate && (
        <AddEventModal
          selectedDate={addingForDate}
          onClose={() => setAddingForDate(null)}
          onAdd={handleAddEvent}
        />
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Your listings</h1>
          <p className="text-sm text-gray-400 mt-1">Long-term rentals · Cebu</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-6">
          {[
            { label: "Occupied",       value: `${occupied} / ${listings.length}`, sub: "units" },
            { label: "Available",      value: available,                           sub: "ready to lease" },
            { label: "Monthly income", value: `₱${(revenue / 1000).toFixed(0)}k`, sub: "active leases" },
          ].map((s, i) => (
            <div key={i} className="bg-white px-5 py-4">
              <p className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-5 border-b border-gray-200">
          {(["listings", "calendar"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === t
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── LISTINGS TAB ── */}
        {activeTab === "listings" && (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 bg-white">
              {listings.map((l) => {
                const s = statusConfig[l.status as keyof typeof statusConfig];
                const days = daysUntil(l.leaseEnd);
                const isOpen = activeListingId === l.id;

                return (
                  <div
                    key={l.id}
                    onClick={() => setActiveListingId(isOpen ? null : l.id)}
                    className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-[15px] truncate">{l.title}</p>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${s.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{l.address}</p>
                        <p className="text-xs text-gray-400 mt-1">{l.type} · {l.area} m² · min. {l.minLease} mo</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'DM Mono', monospace" }}>
                          ₱{l.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">/mo</p>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start justify-between text-sm">
                        <div>
                          {l.tenant ? (
                            <>
                              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Tenant</p>
                              <p className="font-medium text-gray-800">{l.tenant}</p>
                            </>
                          ) : (
                            <p className="text-gray-400">No current tenant</p>
                          )}
                        </div>
                        {l.leaseEnd && (
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Lease ends</p>
                            <p className={`font-medium ${days !== null && days < 60 ? "text-amber-600" : "text-gray-800"}`}>
                              {new Date(l.leaseEnd).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                              {days !== null && days > 0 && days < 90 && (
                                <span className="text-xs text-amber-400 ml-1">({days}d)</span>
                              )}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors"
                        >
                          View details →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="mt-3 w-full py-3 rounded-lg border border-dashed border-gray-300 bg-white text-sm font-medium text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Add a listing
            </button>
          </>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <Calendar events={events} onAddEvent={(date) => setAddingForDate(date)} />

            {/* Legend */}
            <div className="flex gap-4 px-1">
              {(Object.entries(eventConfig) as [EventType, typeof eventConfig[EventType]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-gray-400">{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Upcoming strip */}
            {upcoming.length > 0 && (
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Upcoming · next 14 days</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {upcoming.map((ev) => {
                    const cfg = eventConfig[ev.type];
                    const listing = listings.find((l) => l.id === ev.listingId);
                    const d = new Date(ev.date);
                    return (
                      <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="text-center w-8 shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase">{MONTHS[d.getMonth()].slice(0, 3)}</p>
                          <p className="text-sm font-semibold text-gray-900 leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{d.getDate()}</p>
                        </div>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 font-medium truncate">{ev.title}</p>
                          <p className="text-xs text-gray-400 truncate">{listing?.title}{ev.note ? ` · ${ev.note}` : ""}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.tag}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}